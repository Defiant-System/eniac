<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="blank-view">
	<h2>Welcome to Eniac.</h2>

	<div class="block-buttons">
		<div class="btn" data-click="open-file">
			<i class="icon-folder-open"></i>
			Open&#8230;
		</div>

		<div class="btn disabled_" data-click="from-clipboard">
			<i class="icon-clipboard"></i>
			From clipboard
		</div>
	</div>

	<div class="block-samples" data-click="select-sample">
		<h3>Templates</h3>
		<xsl:call-template name="sample-list" />
	</div>

	<xsl:if test="count(./Recents/*) &gt; 0">
		<div class="block-recent" data-click="select-recent-file">
			<h3>Recent</h3>
			<xsl:call-template name="recent-list" />
		</div>
	</xsl:if>
</xsl:template>


<xsl:template name="sample-list">
	<xsl:for-each select="./Samples/*">
		<div class="sample">
			<xsl:attribute name="style">background-image: url(<xsl:value-of select="@img"/>);</xsl:attribute>
			<xsl:attribute name="data-url"><xsl:value-of select="@path"/></xsl:attribute>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="recent-list">
	<xsl:for-each select="./Recents/*">
		<div class="recent-file">
			<xsl:attribute name="data-file"><xsl:value-of select="@path"/></xsl:attribute>
			<span class="thumbnail">
				<xsl:attribute name="style">background-image: url(<xsl:value-of select="@img"/>);</xsl:attribute>
			</span>
			<span class="name"><xsl:call-template name="get-file-name">
									<xsl:with-param name="path" select="@path"/>
								</xsl:call-template></span>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="get-file-name">
	<xsl:param name="path"/>
	<xsl:choose>
		<xsl:when test="contains($path, '/')">
			<xsl:call-template name="get-file-name">
				<xsl:with-param name="path" select="substring-after($path, '/')"/>
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$path"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>



<xsl:template name="functions-list">
	<ul class="match-list">
		<xsl:for-each select=".//Functions/*">
			<xsl:sort select="@name" data-type="string" order="ascending"/>
			<li><xsl:value-of select="@name"/></li>
		</xsl:for-each>
	</ul>
</xsl:template>


<xsl:template name="function-body">
	<p class="intro">
		<xsl:value-of select=".//*[@type='intro']/text()"/>
	</p>

	<h3>
		<span class="fn-name"><xsl:value-of select="@name"/></span>
		<span class="fn-args">
			<xsl:for-each select=".//*[@type='arguments']/*">
				<span><xsl:value-of select="@name"/></span>
			</xsl:for-each>
		</span>
	</h3>
	<ul class="arguments divider">
		<xsl:for-each select=".//*[@type='arguments']/*">
			<li>
				<span class="arg"><xsl:value-of select="@name"/></span>
				<xsl:value-of select="text()"/>
			</li>
		</xsl:for-each>
	</ul>

	<h4>Notes</h4>
	<ul class="notes divider">
		<xsl:for-each select=".//*[@type='notes']/*">
			<li><xsl:value-of select="text()"/></li>
		</xsl:for-each>
	</ul>

	<h4>Examples</h4>
	<ul class="examples divider">
		<xsl:for-each select=".//*[@type='examples']/*">
			<li><xsl:value-of select="text()"/></li>
		</xsl:for-each>
	</ul>

	<xsl:if test=".//*[@type='also']">
		<h4>See also</h4>
		<ul class="see-also" data-click="see-also">
			<xsl:for-each select=".//*[@type='also']/*">
				<li><xsl:value-of select="@name"/></li>
			</xsl:for-each>
		</ul>
	</xsl:if>
</xsl:template>


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
		<xsl:if test="@style">
			<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
		</xsl:if>
		<div autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
			<xsl:value-of select="text()" disable-output-escaping="yes"/>
		</div>
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
			<xsl:if test="Dim/@zIndex">
				z-index: <xsl:value-of select="Dim/@zIndex"/>;
			</xsl:if>
			<xsl:if test="Shadow">
				box-shadow: <xsl:value-of select="Shadow/@x"/>px <xsl:value-of select="Shadow/@y"/>px <xsl:value-of select="Shadow/@blur"/>px <xsl:value-of select="Shadow/@color"/>;
			</xsl:if>
			<xsl:if test="Border">
				border: <xsl:value-of select="Border/@width"/>px <xsl:value-of select="Border/@style"/> <xsl:value-of select="Border/@color"/>;
			</xsl:if>
			<xsl:if test="Mask/@x">
				--mY: <xsl:value-of select="Mask/@y"/>px;
				--mX: <xsl:value-of select="Mask/@x"/>px;
				--mW: <xsl:value-of select="Mask/@w"/>px;
				--mH: <xsl:value-of select="Mask/@h"/>px;
			</xsl:if>
			<xsl:if test="Filter/@reflection">-webkit-box-reflect: below 3px -webkit-linear-gradient(bottom, rgba(255, 255, 255, <xsl:value-of select="Filter/@reflection"/>) 0%, transparent 50%, transparent 100%);</xsl:if>
			<xsl:if test="Filter/@opacity">opacity: <xsl:value-of select="Filter/@opacity"/>;</xsl:if>
			<xsl:if test="Filter/@brightness">--brightness: <xsl:value-of select="Filter/@brightness"/>;</xsl:if>
			<xsl:if test="Filter/@saturate">--saturate: <xsl:value-of select="Filter/@saturate"/>;</xsl:if>
		</xsl:attribute>
		<xsl:if test="Text/@title">
			<div class="img-title"><xsl:value-of select="Text/@title"/></div>
		</xsl:if>
		<div class="img-wrapper">
			<div></div>
		</div>
		<xsl:if test="Text/@caption">
			<div class="img-caption"><xsl:value-of select="Text/@caption"/></div>
		</xsl:if>
	</div>
</xsl:template>


<xsl:template name="xl-shape">
	<svg>
		<xsl:if test="@id"><xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute></xsl:if>
		<xsl:attribute name="class">xl-shape <xsl:value-of select="@class"/></xsl:attribute>
		<xsl:attribute name="viewBox"><xsl:value-of select="@viewBox"/></xsl:attribute>
		<xsl:attribute name="style">
			<xsl:value-of select="@style"/>
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
		<xsl:attribute name="class">xl-table <xsl:value-of select="@class"/>
			<xsl:if test="@width and @height"> clipped</xsl:if>
		</xsl:attribute>
		<xsl:if test="@style">
			<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@title">
			<div class="tbl-title"><span><xsl:value-of select="@title"/></span></div>
		</xsl:if>
		<xsl:call-template name="scaffold-table" />
		<xsl:if test="@caption">
			<div class="tbl-caption"><span><xsl:value-of select="@caption"/></span></div>
		</xsl:if>
	</div>
</xsl:template>


<xsl:template name="scaffold-table">
	<div class="tbl-root">
		<xsl:if test="@width and @height">
			<xsl:attribute name="style">
				width: <xsl:value-of select="@width"/>px;
				height: <xsl:value-of select="@height"/>px;
			</xsl:attribute>
		</xsl:if>
		<div class="tbl-col-head">
			<div>
				<table>
					<xsl:for-each select="R[@tp='1']">
					<tr>
						<xsl:for-each select="C[@tp='4']">
							<xsl:call-template name="table-cell" />
						</xsl:for-each>
					</tr>
					</xsl:for-each>
				</table>
			</div>
			<div>
				<table>
					<xsl:for-each select="R[@tp='1']">
					<tr>
						<xsl:for-each select="C[not(@tp)]">
							<xsl:call-template name="table-cell" />
						</xsl:for-each>
					</tr>
					</xsl:for-each>
				</table>
			</div>
		</div>
		<div class="tbl-body">
			<div>
				<table>
					<xsl:if test="count( R[@tp='2']/C[@tp='4'] )">
						<xsl:for-each select="R[@tp='2']">
						<tr>
							<xsl:for-each select="C[@tp='4']">
								<xsl:call-template name="table-cell" />
							</xsl:for-each>
						</tr>
						</xsl:for-each>
					</xsl:if>
				</table>
			</div>
			<div>
				<table>
					<xsl:for-each select="R[@tp='2']">
					<tr>
						<xsl:for-each select="C[not(@tp)]">
							<xsl:call-template name="table-cell" />
						</xsl:for-each>
					</tr>
					</xsl:for-each>
				</table>
			</div>
		</div>
		<div class="tbl-col-foot">
			<div>
				<table>
					<xsl:for-each select="R[@tp='3']">
					<tr>
						<xsl:for-each select="C[@tp='4']">
							<xsl:call-template name="table-cell" />
						</xsl:for-each>
					</tr>
					</xsl:for-each>
				</table>
			</div>
			<div>
				<table>
					<xsl:for-each select="R[@tp='3']">
					<tr>
						<xsl:for-each select="C[not(@tp)]">
							<xsl:call-template name="table-cell" />
						</xsl:for-each>
					</tr>
					</xsl:for-each>
				</table>
			</div>
		</div>
	</div>
</xsl:template>


<xsl:template name="table-cell">
	<td>
		<xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute>
		<xsl:if test="@t">
			<xsl:attribute name="t"><xsl:value-of select="@t"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@f">
			<xsl:attribute name="f"><xsl:value-of select="@f"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@rs">
			<xsl:attribute name="rowspan"><xsl:value-of select="@rs"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@cs">
			<xsl:attribute name="colspan"><xsl:value-of select="@cs"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@cn">
			<xsl:attribute name="class"><xsl:value-of select="@cn"/></xsl:attribute>
		</xsl:if>
		<xsl:if test="@style">
			<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
		</xsl:if>
		<xsl:value-of select="." disable-output-escaping="yes"/>
	</td>
</xsl:template>


<xsl:template name="footer">
	<xsl:choose>
		<xsl:when test="@type = 'selection'">
			<xsl:call-template name="type-selection" />
		</xsl:when>
		<xsl:when test="@type = 'f'">
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
			<xsl:call-template name="parse-formula" />
		</div>
	</div>
</xsl:template>


<xsl:template name="parse-formula">
	<xsl:for-each select="./*">
		<xsl:choose>
			<xsl:when test="name() = 'g'">
				<span class="f-group">
					<xsl:attribute name="data-func"><xsl:value-of select="@func"/></xsl:attribute>
					<xsl:call-template name="parse-formula" />
				</span>
			</xsl:when>
			<xsl:when test="name() = 't' and @type = 'range'">
				<span class="f-value"><xsl:value-of select="@value"/></span>
			</xsl:when>
			<xsl:when test="name() = 't' and @type = 'number'">
				<span class="f-number"><xsl:value-of select="@value"/></span>
			</xsl:when>
			<xsl:when test="name() = 't' and @type = 'text'">
				<span class="f-text">"<xsl:value-of select="@value"/>"</span>
			</xsl:when>
			<xsl:when test="name() = 'i'">
				<i><xsl:value-of select="@value"/></i>
			</xsl:when>
		</xsl:choose>
	</xsl:for-each>
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
