import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const kickstarterURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

const movieURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const gameURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const fetchData = async (url) => {
  const response = await fetch(url);
  return await response.json();
};

Promise.all([
  fetchData(kickstarterURL),
  fetchData(movieURL),
  fetchData(gameURL),
]).then(([kickstarterData, movieData, gameData]) => {
  const tooltip = d3
    .select("#container")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", "1000px")
    .attr("height", "700px");

  const color = d3.scaleOrdinal(d3.schemeSet2);

  const hierarchy = d3.hierarchy(gameData).sum((d) => d.value);

  const treemap = d3.treemap().size([1000, 660]).paddingInner(5)(hierarchy);

  const childArray = treemap.descendants().filter((d) => d.depth === 2);
  const parentArray = treemap.descendants().filter((d) => d.depth === 1);

  const matchParent = (category) =>
    parentArray.findIndex((x) => x.data.name === category);

  const cells = svg
    .selectAll(".cells")
    .data(childArray)
    .enter()
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("stroke", "white")
    .style("fill", (d) => color(matchParent(d.parent.data.name)))
    .on("mouseover", function (e, d) {
      d3.select(this).attr("class", "cells highlighted");
      tooltip
        .style("opacity", 0.75)
        .html(
          `Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`
        )
        .style("left", e.pageX + 15 + "px")
        .style("top", e.pageY - 50 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("class", "cells");
      tooltip.style("opacity", 0);
    });

  // svg
  //   .selectAll("text")
  //   .data(childArray)
  //   .enter()
  //   .append("text")
  //   .attr("x", (d) => d.x0 + (d.x1 - d.x0) / 2)
  //   .attr("y", (d) => d.y0 + (d.y1 - d.y0) / 2)
  //   .attr("fill", "black")
  //   .text((d) => d.data.name);
});
