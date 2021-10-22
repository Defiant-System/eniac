<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="xl-file">
	<xsl:for-each select="./Text"><xsl:call-template name="xl-text" /></xsl:for-each>
	<xsl:for-each select="./Image"><xsl:call-template name="xl-image" /></xsl:for-each>
	<xsl:for-each select="./Shape"><xsl:call-template name="xl-shape" /></xsl:for-each>
	<xsl:for-each select="./Table"><xsl:call-template name="xl-table" /></xsl:for-each>
</xsl:template>


<xsl:template name="xl-text">
	<div class="xl-text">
		<xsl:if test="@class">
			<xsl:attribute name="class">xl-text <xsl:value-of select="@class"/></xsl:attribute>
		</xsl:if>
		<xsl:value-of select="." disable-output-escaping="yes"/>
	</div>
</xsl:template>


<xsl:template name="xl-image">
	<div class="xl-image">
		<xsl:if test="@class">
			<xsl:attribute name="class">xl-image <xsl:value-of select="@class"/></xsl:attribute>
		</xsl:if>
		<xsl:attribute name="style">
			background-image: url(<xsl:value-of select="normalize-space(.)"/>);
			top: <xsl:value-of select="Dim/@y"/>px;
			left: <xsl:value-of select="Dim/@x"/>px;
			width: <xsl:value-of select="Dim/@w"/>px;
			height: <xsl:value-of select="Dim/@h"/>px;
			<xsl:if test="./Mask/@x">
				--mY: <xsl:value-of select="Mask/@y"/>px;
				--mX: <xsl:value-of select="Mask/@x"/>px;
				--mW: <xsl:value-of select="Mask/@w"/>px;
				--mH: <xsl:value-of select="Mask/@h"/>px;
			</xsl:if>
		</xsl:attribute>
		<div></div>
	</div>
</xsl:template>


<xsl:template name="xl-shape">
	<svg>
		<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
		<xsl:attribute name="class">xl-shape <xsl:value-of select="@class"/></xsl:attribute>
		<xsl:attribute name="viewBox"><xsl:value-of select="@viewBox"/></xsl:attribute>
		<xsl:attribute name="style">
			width: <xsl:call-template name="getViewboxValue">
						<xsl:with-param name="text" select="@viewBox"/>
						<xsl:with-param name="index" select="3"/>
					</xsl:call-template>px;
			height: <xsl:call-template name="getViewboxValue">
						<xsl:with-param name="text" select="@viewBox"/>
						<xsl:with-param name="index" select="4"/>
					</xsl:call-template>px;
		</xsl:attribute>
		<xsl:value-of select="." disable-output-escaping="yes"/>
	</svg>
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


<xsl:template name="getViewboxValue">
	<xsl:param name="text"/>
    <xsl:param name="index"/>
	<xsl:param name="i" select="1"/>
    <xsl:choose>
    	<xsl:when test="$index = $i">
    		<xsl:value-of select="substring-before( $text, ' ' )"/>
    		<xsl:if test="not( contains( $text, ' ' ) )"><xsl:value-of select="$text"/></xsl:if>
    	</xsl:when>
    	<xsl:otherwise>
    		<xsl:call-template name="getViewboxValue">
				<xsl:with-param name="text" select="substring-after( $text, ' ' )"/>
				<xsl:with-param name="index" select="$index"/>
				<xsl:with-param name="i" select="$i + 1"/>
			</xsl:call-template>
    	</xsl:otherwise>
    </xsl:choose>
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
