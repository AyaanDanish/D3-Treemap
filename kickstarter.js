import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const kickURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

const fetchData = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

fetchData(kickURL).then((kickData) => {
  const tooltip = d3
    .select("#container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const treeSVG = d3
    .select("#svg-cont")
    .append("svg")
    .attr("width", "1400px")
    .attr("height", "700px");

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const hierarchy = d3.hierarchy(kickData).sum((d) => d.value);

  hierarchy.children.sort(
    (a, b) => b.data.children.length - a.data.children.length
  );

  const treemap = d3.treemap().size([1400, 700]).paddingInner(5)(hierarchy);

  const childArray = treemap.descendants().filter((d) => d.depth === 2);
  const parentArray = treemap.descendants().filter((d) => d.depth === 1);

  const matchParent = (category) =>
    parentArray.findIndex((x) => x.data.name === category);

  treeSVG
    .selectAll(".cells")
    .data(childArray)
    .enter()
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("fill", (d) => color(matchParent(d.parent.data.name)))
    .on("mousemove", function (e, d) {
      d3.select(this).attr("class", "cells highlighted");

      tooltip
        .style("opacity", 0.75)
        .html(
          `Game: ${d.data.name}<br>Category: ${
            d.data.category
          }<br>Value: $${Number(d.data.value).toLocaleString("en-US")}`
        )
        .style("left", e.pageX + 15 + "px")
        .style("top", e.pageY - 50 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("class", "cells");
      tooltip.style("opacity", 0);
    });

  const legendSVG = d3
    .select("#svg-cont")
    .append("svg")
    .attr("width", "300")
    .attr("height", "700px")
    .attr("id", "legend-svg");

  const categories = parentArray.map((d) => d.data.name);

  const legendColor = d3
    .scaleOrdinal()
    .domain(categories)
    .range(d3.schemeCategory10);

  const legendRectSize = 18; // Size of each colored rectangle
  const legendSpacing = 6; // Spacing between rectangles and text labels

  const legend = legendSVG
    .selectAll(".legend")
    .data(categories)
    .enter()
    .append("g")
    .attr(
      "transform",
      (d, i) => `translate(100, ${100 + i * (legendRectSize + legendSpacing)})`
    );

  legend
    .append("rect")
    .attr("width", legendRectSize)
    .attr("height", legendRectSize)
    .style("fill", legendColor);

  legend
    .append("text")
    .attr("x", legendRectSize + legendSpacing)
    .attr("y", legendRectSize / 2)
    .attr("dy", "0.35em")
    .style("font-family", "Montserrat")
    .style("font-weight", 600)
    .text((d) => d);
});
