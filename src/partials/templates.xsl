<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="xl-text">
	<div class="xl-text">
		<xsl:value-of select="normalize-space(.)"/>
	</div>
</xsl:template>


<xsl:template name="xl-image">
	<div class="xl-image">
		<img>
			<xsl:attribute name="src"><xsl:value-of select="normalize-space(.)"/></xsl:attribute>
		</img>
	</div>
</xsl:template>


<xsl:template name="xl-table">
	<div class="xl-table">
		<xsl:if test="@class">
			<xsl:attribute name="class">xl-table <xsl:value-of select="@class"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@title">
			<div class="table-title"><xsl:value-of select="@title"/></div>
		</xsl:if>
		<xsl:call-template name="scaffold-table" />
		<xsl:if test="@caption">
			<div class="table-caption"><xsl:value-of select="@caption"/></div>
		</xsl:if>
	</div>
</xsl:template>


<xsl:template name="scaffold-table">
	<div class="tbl-root">
		<div class="tbl-col-head">
			<div>
				<table>
					<xsl:for-each select="Head/Table[1]/Row">
						<xsl:call-template name="table-row" />
					</xsl:for-each>
				</table>
			</div>
			<div>
				<table>
					<xsl:for-each select="Head/Table[2]/Row">
						<xsl:call-template name="table-row" />
					</xsl:for-each>
				</table>
			</div>
		</div>
		<div class="tbl-body">
			<div>
				<table>
					<xsl:for-each select="Body/Table[1]/Row">
						<xsl:call-template name="table-row" />
					</xsl:for-each>
				</table>
			</div>
			<div>
				<table>
					<xsl:for-each select="Body/Table[2]/Row">
						<xsl:call-template name="table-row" />
					</xsl:for-each>
				</table>
			</div>
		</div>
		<div class="tbl-col-foot">
			<div>
				<table>
					<xsl:for-each select="Foot/Table[1]/Row">
						<xsl:call-template name="table-row" />
					</xsl:for-each>
				</table>
			</div>
			<div>
				<table>
					<xsl:for-each select="Foot/Table[2]/Row">
						<xsl:call-template name="table-row" />
					</xsl:for-each>
				</table>
			</div>
		</div>
	</div>
</xsl:template>


<xsl:template name="table-row">
	<tr>
		<xsl:for-each select="Cell">
			<xsl:call-template name="table-cell" />
		</xsl:for-each>
	</tr>
</xsl:template>

<xsl:template name="table-cell">
	<td><xsl:value-of select="@value"/></td>
</xsl:template>


<xsl:template name="footer">
	<xsl:choose>
		<xsl:when test="@type = 'selection'">
			<xsl:call-template name="type-selection" />
		</xsl:when>
		<xsl:when test="@type = 'formula'">
			<xsl:call-template name="type-formula" />
		</xsl:when>
		<xsl:otherwise>
			<xsl:call-template name="type-text" />
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>


<xsl:template name="type-text">
	<div class="selection-type"><xsl:call-template name="get-footer-type" /></div>
	<div class="selection-value">
		<xsl:value-of select="text()"/>
	</div>
</xsl:template>


<xsl:template name="type-selection">
	<div class="selection-data">
		<div class="data">
			<label>Sum</label>
			<span><xsl:call-template name="sum-value" /></span>
		</div>
		<div class="data">
			<label>Average</label>
			<span><xsl:call-template name="avg-value" /></span>
		</div>
		<div class="data">
			<label>Min</label>
			<span><xsl:call-template name="min-value" /></span>
		</div>
		<div class="data">
			<label>Max</label>
			<span><xsl:call-template name="max-value" /></span>
		</div>
		<div class="data">
			<label>Counta</label>
			<span><xsl:value-of select="count(./*)"/></span>
		</div>
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


<xsl:template name="get-footer-type">
	<xsl:choose>
		<xsl:when test="@type = 'f'">Formula</xsl:when>
		<xsl:when test="@type = 'n'">Actual</xsl:when>
		<xsl:otherwise>Text</xsl:otherwise>
	</xsl:choose>
</xsl:template>


<xsl:template name="sum-value">
	<xsl:variable name="value" select="sum(./*[@type='n'])" />
	<xsl:choose>
		<xsl:when test="number($value) != $value">0</xsl:when>
		<xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="avg-value">
	<xsl:variable name="value" select="sum(./*[@type='n']) div count(./*[@type='n'])" />
	<xsl:choose>
		<xsl:when test="number($value) != $value"></xsl:when>
		<xsl:otherwise><xsl:value-of select="$value"/></xsl:otherwise>
	</xsl:choose>
</xsl:template>

<xsl:template name="max-value">
	<xsl:for-each select="./*[@type='n']">
		<xsl:sort select="." data-type="number" order="descending"/>
		<xsl:if test="position() = 1"><xsl:value-of select="text()"/></xsl:if>
	</xsl:for-each>
	<xsl:if test="count(./*[@type='n']) = 0">0</xsl:if>
</xsl:template>

<xsl:template name="min-value">
	<xsl:for-each select="./*[@type='n']">
		<xsl:sort select="." data-type="number" order="ascending"/>
		<xsl:if test="position() = 1"><xsl:value-of select="text()"/></xsl:if>
	</xsl:for-each>
	<xsl:if test="count(./*[@type='n']) = 0">0</xsl:if>
</xsl:template>

</xsl:stylesheet>
