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
Probe: sitemap|https://agritani.com/sitemap.xml|200-299|sitemap|1000

## Not applicable

agritani.com is a static site on Cloudflare Workers static assets: no database,
background jobs, queues, or server-side error sentinel exist, so no probes for
them. Add them only if a runtime (for example the future CMS, DEC-012) is added.
