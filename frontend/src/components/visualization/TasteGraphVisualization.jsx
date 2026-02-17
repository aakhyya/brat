import { useEffect, useRef } from "react";
import * as d3 from "d3"; //d3 does not have a default export. It uses named exports.
//So you're saying give me the entire D3 namespace object.

function TasteGraphVisualization({ data }) { //data -> nodes and edges
    const svgRef = useRef(null); // points to svg elements
    useEffect(() => {
        if (!data || !data.nodes || data.nodes.length === 0) {
            return;
        }

        d3.select(svgRef.current).selectAll("*").remove(); //removes old graph b4 new one
        const width = 800;
        const height = 600;

        const svg = d3
            .select(svgRef.current) //select element
            .attr("width", width) //set width, height and viewbox for responsiveness
            .attr("heigth", height)
            .attr("viewBox", [0, 0, width, height]);//All drawings are inside a 0 → width and 0 → height universe
        const g = svg.append("g"); //groups elements together for zooming, pan, transform
        const zoom = d3.zoom()
            .scaleExtent([0.5, 3]) //Min/max zoom levels
            .on("zoom", (event) => {
                g.attr("transform", event.transform); //On zoom, transforms the <g> container
            });

        svg.call(zoom); //Enables zoom on SVG

        const simulation = d3
            .forceSimulation(data.nodes) //starts movement with nodes
            .force("link", d3.forceLink(data.edges) // Edges pull connected nodes together
                .id(d => d.id)
                .distance(100)) // keeps 100px dist. in b/w
            .force("charge", d3.forceManyBody() // Nodes repel each other
                .strength(-300))  //-300=strong repulsion; Bigger negative=stronger push
            .force("center", d3.forceCenter(width / 2, height / 2)) //Pulls all nodes toward center of screen
            .force("collision", d3.forceCollide() //Prevents nodes from overlapping
                .radius(30)); // keeps min. radius of 30px
        const link = g //Creates <line> elements for each edge
            .append("g") //creating another invisible folder inside me g element
            .selectAll("line") //selecting all lines
            .data(data.edges) //each edge obj has it's own line element
            .join("line") // 40 edges → 40 SVG lines.
            .attr("stroke", "#4ade80") //green line
            .attr("stroke-opacity", 0.3) //transparent 
            .attr("stroke-width", d => d.strength * 3); //width depends on similarity

        const node = g //Creates <circle> elements for each nodes
            .append("g")
            .selectAll("circle")
            .data(data.nodes)
            .join("circle")
            .attr("r", d => 10 + d.value * 20) //bigger radius -> stronger preference
            .attr("fill", d => d.color) //fill node w category color
            .attr("stroke", "#fff") //white border
            .attr("stroke-width", 2)
            .style("cursor", "pointer")
            .call(drag(simulation));//Click a node, Move it, Physics adjusts around it

        const label = g //Creates <text> labels for nodes
            .append("g")
            .selectAll("text")
            .data(data.nodes)
            .join("text")
            .text(d => d.label)
            .attr("font-size", 10)
            .attr("fill", "#fff") //white text
            .attr("text-anchor", "middle") //Centers the text horizontally relative to its x position
            .attr("dy", -20) //moves the label 20px upward
            .style("pointer-events", "none"); //ignore mouse events

        node
            .on("mouseover", function (event, d) { // node grows (+5 radius) and glows
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 10 + d.value * 20 + 5)
                    .style("filter", "drop-shadow(0 0 10px " + d.color + ")");
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 10 + d.value * 20)
                    .style("filter", "none");
            });

        simulation.on("tick", () => { //For every frame, move everything according to physics
            link //Lines follow nodes
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            node //Nodes move
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
            label //Labels follow nodes
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        return () => { //cleanup
            simulation.stop();
        };

    },[data]);

    return (
    <div className="w-full h-full bg-black rounded-lg border-2 border-green-400/30 overflow-hidden">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );

}

export default TasteGraphVisualization;