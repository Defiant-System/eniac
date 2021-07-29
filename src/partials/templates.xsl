<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="barebone-table">
	<div class="sheet">
		<div class="table-wrapper">
			<div class="tbl-col-head">
				<table></table>
			</div>
			<div class="tbl-body">
				<div class="tbl-row-head">
					<table></table>
				</div>
				<div class="tbl-row-body">
					<table>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
						<tr><td></td><td></td><td></td><td></td><td></td></tr>
					</table>
				</div>
			</div>
			<div class="tbl-col-foot">
				<table></table>
			</div>
		</div>
	</div>
</xsl:template>

<xsl:template name="gray-table-1">
	<div class="sheet gray-table-1" data-col-head="1" data-row-head="1" data-col-foot="1">
		<div class="table-title">Title</div>
		<xsl:call-template name="empty-table" />
	</div>
</xsl:template>

<xsl:template name="blue-table-1">
	<div class="sheet blue-table-1" data-col-head="1" data-row-head="1" data-col-foot="1">
		<div class="table-title">Title</div>
		<xsl:call-template name="empty-table" />
	</div>
</xsl:template>

<xsl:template name="green-table-1">
	<div class="sheet green-table-1" data-col-head="1" data-row-head="1" data-col-foot="1">
		<div class="table-title">Title</div>
		<xsl:call-template name="empty-table" />
	</div>
</xsl:template>

<xsl:template name="blue-table-2">
	<div class="sheet blue-table-2" data-col-head="1" data-row-head="1" data-col-foot="1">
		<div class="table-title">Title</div>
		<xsl:call-template name="empty-table" />
	</div>
</xsl:template>

<xsl:template name="orange-table-1">
	<div class="sheet orange-table-1" data-col-head="1" data-row-head="1" data-col-foot="1">
		<div class="table-title">Title</div>
		<xsl:call-template name="empty-table" />
	</div>
</xsl:template>

<xsl:template name="white-table-1">
	<div class="sheet white-table-1" data-col-head="1" data-row-head="1" data-col-foot="1">
		<div class="table-title">Title</div>
		<xsl:call-template name="empty-table" />
	</div>
</xsl:template>


<xsl:template name="empty-table">
	<div class="table-wrapper">
		<div class="tbl-col-head">
			<table>
				<tr><td></td><td></td><td></td><td></td><td></td></tr>
			</table>
		</div>
		<div class="tbl-body">
			<div class="tbl-row-head">
				<table>
					<tr><td></td></tr>
					<tr><td></td></tr>
					<tr><td></td></tr>
					<tr><td></td></tr>
					<tr><td></td></tr>
					<tr><td></td></tr>
					<tr><td></td></tr>
				</table>
			</div>
			<div class="tbl-row-body">
				<table>
					<tr><td></td><td></td><td></td><td></td></tr>
					<tr><td></td><td></td><td></td><td></td></tr>
					<tr><td></td><td></td><td></td><td></td></tr>
					<tr><td></td><td></td><td></td><td></td></tr>
					<tr><td></td><td></td><td></td><td></td></tr>
					<tr><td></td><td></td><td></td><td></td></tr>
					<tr><td></td><td></td><td></td><td></td></tr>
				</table>
			</div>
		</div>
		<div class="tbl-col-foot">
			<table>
				<tr><td></td><td></td><td></td><td></td><td></td></tr>
			</table>
		</div>
	</div>
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
