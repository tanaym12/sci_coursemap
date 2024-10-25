const selectedCourse = JSON.parse(localStorage.getItem("selectedCourse"));
console.log("Selected Course in redirect.html:", selectedCourse);

d3.json('all_courses.json').then(coursesData => {
    const innerSVG = d3.select('#secondSVG');
    const g_inner = new dagreD3.graphlib.Graph().setGraph({
        rankdir: 'TB',
        nodesep: 10,
        edgesep: 0,
        ranksep: 100
    });

    const findCourse = code => coursesData.find(course => course.course_code === code);

    function gatherCourses(courseCode, visited) {
        // Initialize visited as a Set if it's not already one
        if (!visited) {
            visited = new Set();
        }
    
        const course = findCourse(courseCode);
        if (!course || visited.has(courseCode)) return;
    
        visited.add(courseCode);
    
        // Add prerequisites and corequisites recursively
        [...course.prerequisites, ...course.corequisites].forEach(course => gatherCourses(course, visited));
        
        return Array.from(visited);
    }

    const graphCourses = gatherCourses(selectedCourse.course_code);

    graphCourses.forEach(course => g_inner.setNode(course, { label: course, id: course }));

    graphCourses.forEach(courseCode => {
        const course = findCourse(courseCode);
        if (!course) return;

        course.prerequisites.forEach(prereq => {
            if (graphCourses.includes(prereq)) {
                g_inner.setEdge(prereq, course.course_code, { 
                    label: "", 
                    id: course.course_code + prereq, 
                    curve: d3.curveBasis, 
                    arrowheadStyle: "fill: #000" 
                });
            }
        });

        course.corequisites.forEach(coreq => {
            if (graphCourses.includes(coreq)) {
                g_inner.setEdge(coreq, course.course_code, { 
                    label: "", 
                    id: course.course_code + coreq, 
                    style: "stroke: coral; stroke-dasharray: 5, 5;",
                    curve: d3.curveBasis, 
                    arrowheadStyle: "fill: coral" 
                });
            }
        });
    });

    console.log(g_inner.edges());

    function renderGraph() {
        g_inner.nodes().forEach(v => {
            const node = g_inner.node(v);
            node.rx = node.ry = 100; // Rounded corners for nodes
        });

        const inner = innerSVG.append("g");
        const zoom = d3.zoom().on("zoom", (event) => inner.attr("transform", event.transform));
        innerSVG.call(zoom);

        const render = new dagreD3.render();
        render(inner, g_inner);

        const initialScale = 0.8;
        const graphWidth = g_inner.graph().width || 0;

        innerSVG.call(zoom.transform, d3.zoomIdentity
            .translate((innerSVG.attr("width") - graphWidth * initialScale) / 2, 30)
            .scale(initialScale)
        );

        inner.selectAll("g.node").on("click", function(_event, d) {
            const course = findCourse(d);
            if (course) {
                document.getElementById("course-title").innerText = course.course_code;
                document.getElementById("course-description").innerText = course.description || "No description available.";
                document.getElementById("dialog").style.display = "block";
            }
        });

        inner.selectAll("g.node").select("rect")
            .style("fill", d => d === selectedCourse.course_code ? "#EEDFCC" : null);

        inner.selectAll("g.node").on("mouseover", function(event, d) {
            const course = findCourse(d);
            d3.select(this).select("rect").style("fill", d === selectedCourse.course_code ? "#EEDFCC" : "cyan");
            d3.select(this).select("text").style("font-weight", "bold");
            d3.select(this).style("opacity", 1);

            inner.selectAll("g.node").filter(n => n !== d).style("opacity", 0.2);
            inner.selectAll("g.edgePath").style("opacity", 0.2);

            if (course) {
                [...course.prerequisites, ...course.corequisites].forEach(code => {
                    inner.select(`g.node[id="${code}"]`).select("rect").style("fill", course.prerequisites.includes(code) ? "cyan" : "coral");
                    inner.select(`g.node[id="${code}"]`).select("text").style("font-weight", "bold");
                    inner.select(`g.node[id="${code}"]`).style("opacity", 1);
                    inner.select(`g.edgePath[id*="${d + code}"]`).style("opacity", 1)
                        .select("path")
                        .style("stroke-width", "3px")
                        .style("stroke", course.prerequisites.includes(code) ? "black" : "coral")
                        .style("stroke-dasharray", course.prerequisites.includes(code) ? "none" : "5, 5");
                });
            }
        });

        inner.selectAll("g.node").on("mouseout", function(event, d) {
            const course = findCourse(d);
            d3.select(this).select("rect").style("fill", d === selectedCourse.course_code ? "#EEDFCC" : null);
            d3.select(this).select("text").style("font-weight", null);
            d3.select(this).style("opacity", 1);

            inner.selectAll("g.node").style("opacity", 1);
            inner.selectAll("g.edgePath").style("opacity", 1);

            if (course) {
                [...course.prerequisites, ...course.corequisites].forEach(code => {
                    inner.select(`g.node[id="${code}"]`).select("rect").style("fill", null);
                    inner.select(`g.node[id="${code}"]`).select("text").style("font-weight", null);
                    inner.select(`g.edgePath[id*="${d + code}"]`).style("opacity", 1)
                        .select("path")
                        .style("stroke-width", "1.5px")
                        .style("stroke", course.prerequisites.includes(code) ? "black" : "coral")
                        .style("stroke-dasharray", course.prerequisites.includes(code) ? "none" : "5, 5");
                });
            }
        });
    }

    document.getElementById("close-dialog").onclick = () => {
        document.getElementById("dialog").style.display = "none";
    };

    renderGraph();
});
