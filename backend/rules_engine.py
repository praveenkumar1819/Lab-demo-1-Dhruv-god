from typing import List, Dict, Any
from datetime import datetime, timezone
from models import SecurityEvent, Alert
from sample_data import USER_DIRECTORY, HOST_DIRECTORY, NETWORK_DIRECTORY

def parse_iso(ts_str: str) -> datetime:
    try:
        # Normalize timezone offsets for standard Python datetime
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except Exception:
        return datetime.now(timezone.utc)

def evaluate_rules(events: List[SecurityEvent]) -> List[Alert]:
    """
    Evaluates educational detection rules against the event collection:
    RULE 1 — Multiple Failed Logins: >= 5 failed logins, same user & IP in 5 min -> Medium
    RULE 2 — Successful Login: normal successful login -> Low
    RULE 3 — Suspicious Login: failed login followed by success within short period -> Medium
    RULE 4 — Expected Activity: marked source_type (authorized_admin, known_scanner, internal_test) -> Expected Activity
    """
    alerts: List[Alert] = []
    alert_counter = 1

    # Sort events by timestamp
    sorted_events = sorted(events, key=lambda e: parse_iso(e.timestamp))

    # Track processed events to avoid excessive redundant alerts
    processed_failed_groups = set()
    processed_suspicious = set()
    processed_admin_events = set()
    single_success_processed = set()

    # Pass 1: Identify RULE 4 - Expected Activity (metadata indicates authorized/scanner/internal test)
    for evt in sorted_events:
        metadata = evt.metadata or {}
        source_type = metadata.get("source_type")
        if source_type in ["authorized_admin", "known_scanner", "internal_test"]:
            key = (evt.user, evt.host, source_type)
            if key not in processed_admin_events:
                processed_admin_events.add(key)
                user_info = USER_DIRECTORY.get(evt.user, {})
                host_info = HOST_DIRECTORY.get(evt.host, {})
                net_info = NETWORK_DIRECTORY.get(evt.source_ip, {})

                related_evts = [e.id for e in sorted_events if (e.metadata or {}).get("source_type") == source_type and e.user == evt.user]

                alerts.append(Alert(
                    id=f"ALT-{alert_counter:03d}",
                    name=f"Expected Administrative Activity ({source_type})",
                    severity="Low",
                    status="OPEN",
                    timestamp=evt.timestamp,
                    user=evt.user,
                    host=evt.host,
                    source_ip=evt.source_ip,
                    event_count=len(related_evts),
                    related_event_ids=related_evts,
                    description=f"Activity originating from flagged source '{source_type}'. Potential False Positive / Expected Activity.",
                    what_happened=f"User {evt.user} generated authentication events tagged with source '{source_type}'.",
                    why_generated="RULE 4 triggered: Metadata identified pre-approved administrative or scanning identity.",
                    when_occurred=evt.timestamp,
                    account_type=user_info.get("account_type", "Domain Administrator"),
                    department=user_info.get("department", "IT Infrastructure"),
                    host_os=host_info.get("os", "Windows Server"),
                    connection_info=f"Source: {evt.source_ip} ({net_info.get('zone', 'Internal')}) -> Host: {evt.host}",
                    failed_attempts=1 if any(e.result == "failure" for e in sorted_events if e.id in related_evts) else 0,
                    classification_type="Expected Activity",
                    decision="Benign",
                    notes="Authorized admin session routine detected. Flagged for educational review."
                ))
                alert_counter += 1

    # Pass 2: Identify RULE 1 & RULE 3 on authentication events
    # Group by (user, source_ip)
    user_ip_events: Dict[tuple, List[SecurityEvent]] = {}
    for evt in sorted_events:
        # Skip events that were part of Rule 4
        if (evt.metadata or {}).get("source_type") in ["authorized_admin", "known_scanner", "internal_test"]:
            continue
        if evt.event_type == "authentication" or evt.action == "login":
            key = (evt.user, evt.source_ip)
            user_ip_events.setdefault(key, []).append(evt)

    for (user, src_ip), u_events in user_ip_events.items():
        failed_events = [e for e in u_events if e.result == "failure" or e.event_id == "4625"]
        success_events = [e for e in u_events if e.result == "success" or e.event_id == "4624"]

        # RULE 1: Multiple Failed Logins (>= 5 failures)
        if len(failed_events) >= 5:
            user_info = USER_DIRECTORY.get(user, {})
            first_fail = failed_events[0]
            host = first_fail.host
            host_info = HOST_DIRECTORY.get(host, {})
            net_info = NETWORK_DIRECTORY.get(src_ip, {})

            fail_ids = [e.id for e in failed_events]
            processed_failed_groups.add((user, src_ip))

            alerts.append(Alert(
                id=f"ALT-{alert_counter:03d}",
                name="Multiple Failed Login Attempts",
                severity="Medium",
                status="OPEN",
                timestamp=failed_events[-1].timestamp,
                user=user,
                host=host,
                source_ip=src_ip,
                event_count=len(failed_events),
                related_event_ids=fail_ids,
                description=f"Observed {len(failed_events)} consecutive failed authentication attempts for user {user} from IP {src_ip}.",
                what_happened=f"Account '{user}' registered {len(failed_events)} failed logon attempts within a short time window on {host}.",
                why_generated="RULE 1 triggered: Same user and source IP with >= 5 failed login events within 5 minutes.",
                when_occurred=f"{failed_events[0].timestamp} to {failed_events[-1].timestamp}",
                account_type=user_info.get("account_type", "Standard Domain User"),
                department=user_info.get("department", "Finance"),
                host_os=host_info.get("os", "Windows 11 Enterprise"),
                connection_info=f"Port 445 / SMB NTLMv2 ({net_info.get('zone', 'Corporate LAN')})",
                failed_attempts=len(failed_events),
                decision="Suspicious",
                notes="Rapid failed logons may indicate password spraying or user lockout condition. Triage required."
            ))
            alert_counter += 1

            # RULE 3: Suspicious Login (failures followed by a successful login)
            if len(success_events) > 0:
                first_success = success_events[0]
                success_dt = parse_iso(first_success.timestamp)
                last_fail_dt = parse_iso(failed_events[-1].timestamp)
                time_diff = (success_dt - last_fail_dt).total_seconds()

                if 0 <= time_diff <= 300:  # Within 5 minutes
                    related_all = fail_ids + [first_success.id]
                    processed_suspicious.add((user, src_ip))

                    alerts.append(Alert(
                        id=f"ALT-{alert_counter:03d}",
                        name="Suspicious Login (Failure Followed by Success)",
                        severity="Medium",
                        status="OPEN",
                        timestamp=first_success.timestamp,
                        user=user,
                        host=host,
                        source_ip=src_ip,
                        event_count=len(related_all),
                        related_event_ids=related_all,
                        description=f"User {user} experienced {len(failed_events)} failed logins followed by a successful authentication from {src_ip}.",
                        what_happened="A burst of failed authentication attempts was immediately succeeded by a successful logon.",
                        why_generated="RULE 3 triggered: Multiple failed logons followed by successful logon from same source IP within short duration.",
                        when_occurred=first_success.timestamp,
                        account_type=user_info.get("account_type", "Standard Domain User"),
                        department=user_info.get("department", "Finance"),
                        host_os=host_info.get("os", "Windows 11 Enterprise"),
                        connection_info=f"NTLM / Kerberos Auth to DC ({src_ip})",
                        failed_attempts=len(failed_events),
                        decision="Suspicious",
                        notes="Indicates potential credential guessing that ultimately succeeded, or employee who mistyped password repeatedly. Check with user."
                    ))
                    alert_counter += 1

        # RULE 2: Normal Successful Login (if not part of the failed group)
        for succ in success_events:
            # Check if this success was already part of Rule 3
            if (user, src_ip) in processed_suspicious:
                continue
            if (user, src_ip) in processed_failed_groups:
                continue
            if succ.id in single_success_processed:
                continue

            single_success_processed.add(succ.id)
            user_info = USER_DIRECTORY.get(user, {})
            host_info = HOST_DIRECTORY.get(succ.host, {})
            net_info = NETWORK_DIRECTORY.get(src_ip, {})

            alerts.append(Alert(
                id=f"ALT-{alert_counter:03d}",
                name="Successful Login",
                severity="Low",
                status="OPEN",
                timestamp=succ.timestamp,
                user=user,
                host=succ.host,
                source_ip=src_ip,
                event_count=1,
                related_event_ids=[succ.id],
                description=f"Normal successful logon recorded for {user} on {succ.host}.",
                what_happened=f"User '{user}' successfully authenticated to workstation '{succ.host}'.",
                why_generated="RULE 2 triggered: Standalone successful login event (Windows 4624).",
                when_occurred=succ.timestamp,
                account_type=user_info.get("account_type", "Standard Domain User"),
                department=user_info.get("department", "Human Resources"),
                host_os=host_info.get("os", "Windows 11 Enterprise"),
                connection_info=f"Interactive / Network Logon ({net_info.get('zone', 'Corporate LAN')})",
                failed_attempts=0,
                decision="Benign",
                notes="Standard baseline logon activity."
            ))
            alert_counter += 1

    return alerts
