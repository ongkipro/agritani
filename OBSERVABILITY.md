# Observability Contract — agritani

Updated: 2026-09-29
Status: REQUIRED

Probe format:

```text
Probe format: <name>|<url>|<expected-status>|<contains-or-TBD>|<max-latency-ms>
```

The expected status may be an exact code (`200`) or an inclusive range
(`200-299`). Every configured probe is mandatory. Use stable, non-secret public
endpoints only; private-network probes require an explicit local-test override.

Probe: app|https://agritani.com/|200-299|Agritani|2000
Probe: health|https://agritani.com/robots.txt|200-299|Sitemap:|1000

Probe: article|https://agritani.com/jurnal/jurus-pengendalian-antraknosa-patek-cabai/|200-299|Antraknosa|2000
Probe: weather-tool|https://agritani.com/alat/cuaca-tani/|200-299|Cuaca Tani|2000
Probe: sitemap|https://agritani.com/sitemap-index.xml|200-299|sitemap|1000

## Recommended production probes

Add probes for database connectivity, background jobs, queue/worker health, or a
critical-error sentinel when the application exposes stable HTTP endpoints for
them. Keep vendor-specific credentials and query tokens out of this file.

Examples:

```text
Probe: database|https://example.com/health/db|200-299|ok|750
Probe: background-jobs|https://example.com/health/workers|200-299|ok|1000
Probe: critical-errors|https://example.com/health/errors|200-299|critical_errors=0|1000
```
