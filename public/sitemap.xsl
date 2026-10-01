<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="id">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap XML - Agritani</title>
        <link rel="stylesheet" href="/sitemap.css"/>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <div class="brand">
              <a href="/" class="brand-link">Agritani Official</a>
              <span class="brand-badge">Sitemap XML</span>
            </div>
            <h1 class="title">
              <xsl:choose>
                <xsl:when test="sitemap:sitemapindex">Index Sitemap XML</xsl:when>
                <xsl:otherwise>Sitemap XML Halaman</xsl:otherwise>
              </xsl:choose>
            </h1>
            <p class="desc">
              Peta situs XML resmi Agritani untuk pengindeksan mesin pencari Google, Bing, dan katalog agronomi terstruktur.
              <xsl:if test="sitemap:urlset">
                <span class="back-link"> · <a href="/sitemap.xml">← Kembali ke Index Sitemap</a></span>
              </xsl:if>
            </p>
          </header>

          <xsl:choose>
            <!-- SITEMAP INDEX -->
            <xsl:when test="sitemap:sitemapindex">
              <div class="stats">
                Total Sub-Sitemap: <strong><xsl:value-of select="count(sitemap:sitemapindex/sitemap:sitemap)"/> berkas</strong>
              </div>
              <div class="table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th class="col-num">No</th>
                      <th class="col-loc">Alamat Sub-Sitemap</th>
                      <th class="col-date">Terakhir Diperbarui</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="sitemap:sitemapindex/sitemap:sitemap">
                      <tr>
                        <td class="col-num"><xsl:value-of select="position()"/></td>
                        <td class="col-loc">
                          <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                        </td>
                        <td class="col-date">
                          <xsl:choose>
                            <xsl:when test="sitemap:lastmod">
                              <xsl:value-of select="substring(sitemap:lastmod, 0, 11)"/>
                            </xsl:when>
                            <xsl:otherwise>-</xsl:otherwise>
                          </xsl:choose>
                        </td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:when>

            <!-- URLSET -->
            <xsl:otherwise>
              <div class="stats">
                Total Halaman Terindeks: <strong><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/> halaman</strong>
              </div>
              <div class="table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th class="col-num">No</th>
                      <th class="col-loc">Alamat Halaman (URL)</th>
                      <th class="col-date">Terakhir Diperbarui</th>
                    </tr>
                  </thead>
                  <tbody>
                    <xsl:for-each select="sitemap:urlset/sitemap:url">
                      <tr>
                        <td class="col-num"><xsl:value-of select="position()"/></td>
                        <td class="col-loc">
                          <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                        </td>
                        <td class="col-date">
                          <xsl:choose>
                            <xsl:when test="sitemap:lastmod">
                              <xsl:value-of select="substring(sitemap:lastmod, 0, 11)"/>
                            </xsl:when>
                            <xsl:otherwise>-</xsl:otherwise>
                          </xsl:choose>
                        </td>
                      </tr>
                    </xsl:for-each>
                  </tbody>
                </table>
              </div>
            </xsl:otherwise>
          </xsl:choose>

          <footer class="footer">
            <p>Agritani Official · Portal Pertanian Sains &amp; Lapangan</p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
