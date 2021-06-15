<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="footer">
	<xsl:choose>
		<xsl:when test="@type = 'formula'">
			<xsl:call-template name="type-formula" />
		</xsl:when>
		<xsl:when test="@type = 'actual'">
			<xsl:call-template name="type-actual" />
		</xsl:when>
		<xsl:otherwise>
			<xsl:call-template name="type-text" />
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="type-text">
	<div class="selection-type">Text</div>
	<div class="selection-value">
		<xsl:value-of select="text()"/>
	</div>
</xsl:template>

<xsl:template name="type-actual">
	<div class="selection-type">Actual</div>
	<div class="selection-value">
		<xsl:value-of select="text()"/>
	</div>
</xsl:template>

<xsl:template name="type-formula">
	<div class="selection-type">Formula</div>
	<div class="selection-value">
		<div class="formula">
			<span class="formula-method">Sum</span>
			<span class="formula-value">D1:D15</span>
		</div>
	</div>
</xsl:template>
