function adjustSVGSize() {
    const svg = document.getElementById("mySVG");
    const mainDiv = document.getElementById("main");

    // Get main div dimensions
    const mainWidth = mainDiv.clientWidth;
    const mainHeight = mainDiv.clientHeight;

    // Set SVG dimensions
    svg.setAttribute("width", mainWidth);
    svg.setAttribute("height", mainHeight);
}

// Call the function on page load
window.onload = adjustSVGSize;

// Adjust SVG size on window resize
window.onresize = adjustSVGSize;

d3.json('all_courses.json').then(coursesData => {
    const subjects = [...new Set(coursesData.map(course => course.course_code.slice(0, 4)))];
    const themes = [...new Set(coursesData.flatMap(course => course.themes))];
    
    const dropdownButton = document.getElementById("dropdownButton");
    const dropdownContent = document.getElementById("dropdownContent");

    let selectedSubjects = [];
    let selectedThemes = [];

    // Create initial message text in the SVG
    const svg = d3.select("svg");

    // Set the initial message text
    const initialMessage = svg.append("text")
    .attr("id", "initialMessage")
    .attr("x", "50%")                         // Position horizontally centered
    .attr("y", "50%")                         // Position vertically centered
    .attr("dy", ".35em")                      // Adjust vertical alignment
    .attr("text-anchor", "middle")           // Center the text
    .style("font-size", "60px")              // Font size
    .style("fill", "#8B8378")                  // Text color
    .style("pointer-events", "none")         // Prevent mouse events
    .style("font-family", "Arial, sans-serif") // Use a more modern font
    .style("font-weight", "bold") // Make the text bold
    .style("filter", "url(#text-shadow)")
    .text("Filter Courses from the sidebar"); // Initial message text

    // Populate the dropdown with checkbox options
    subjects.forEach(subject => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = subject;

        checkbox.addEventListener('change', function() {
            if (this.checked) {
                if (selectedSubjects.length < 3) {
                    selectedSubjects.push(this.value);
                } else {
                    this.checked = false; // Prevent more than 3 selections
                }
            } else {
                selectedSubjects = selectedSubjects.filter(subj => subj !== this.value);
            }
            dropdownButton.textContent = `Select Subjects (${selectedSubjects.length}/3)`;
            updateGraph(selectedSubjects); // Update graph based on selections
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(subject));
        dropdownContent.appendChild(label);
    });

    // Toggle dropdown display
    dropdownButton.addEventListener('click', function() {
        dropdownContent.classList.toggle("show");
    });

    // Close dropdown if clicked outside the button and content
    document.addEventListener('click', function(event) {
        const isClickInsideButton = dropdownButton.contains(event.target);
        const isClickInsideContent = dropdownContent.contains(event.target);

        if (!isClickInsideButton && !isClickInsideContent) {
            dropdownContent.classList.remove("show");
        }
    });

    // Create a new directed graph
    var g = new dagreD3.graphlib.Graph().setGraph({
        rankdir: 'TB',
        nodesep: 10,
        edgesep: 0,
        ranksep: 100
    });

    // Function to render the graph
    function renderGraph() {
        // Hide the initial message when the graph is shown
        d3.select("#initialMessage").style("display", "none");

        g.nodes().forEach(function(v) {
            var node = g.node(v);
            node.rx = node.ry = 100; // Rounded corners for nodes
        });

        var inner = svg.append("g");

        var zoom = d3.zoom().on("zoom", function(event) {
            inner.attr("transform", event.transform);
        });
        svg.call(zoom);

        var render = new dagreD3.render();
        render(inner, g);

        var initialScale = 0.55;
        var xOffset = 0;
        var graphWidth = g.graph().width || 0;  // Default to 0 if undefined
        if (graphWidth > 0) {
            svg.call(zoom.transform, d3.zoomIdentity
                .translate((svg.attr("width") - graphWidth * initialScale) / 2 - xOffset, 1)
                .scale(initialScale)
            );
        } else {
            // Fallback positioning if the graph width is 0 or undefined
            svg.call(zoom.transform, d3.zoomIdentity.scale(initialScale));
        }

        inner.selectAll("g.node").on("click", function(event, d) {
            const course = coursesData.find(course => course.course_code === d);
            if (course) {
                document.getElementById("course-title").innerText = course.course_code;
                document.getElementById("course-description").innerText = course.description || "No description available.";
                document.getElementById("dialog").style.display = "block";
            }
        });

        inner.selectAll("g.node").on("mouseover", function(event, d) {
            const course = coursesData.find(course => course.course_code === d);
            d3.select(this).select("rect").style("fill", "cyan");

            if (course && course.prerequisites.length > 0) {
                course.prerequisites.forEach(function(prereq) {
                    inner.select(`g.node[id="${prereq}"]`).select("rect").style("fill", "cyan");
                });
            }

            if (course && course.corequisites.length > 0) {
                course.corequisites.forEach(function(coreq) {
                    inner.select(`g.node[id="${coreq}"]`).select("rect").style("fill", "coral");
                });
            }
        });

        inner.selectAll("g.node").on("mouseout", function(event, d) {
            const course = coursesData.find(course => course.course_code === d);
            d3.select(this).select("rect").style("fill", null);

            if (course) {
                course.prerequisites.forEach(function(prereq) {
                    inner.select(`g.node[id="${prereq}"]`).select("rect").style("fill", null);
                });
            }

            if (course && course.corequisites.length > 0) {
                course.corequisites.forEach(function(coreq) {
                    inner.select(`g.node[id="${coreq}"]`).select("rect").style("fill", null);
                });
            }
        });
    }

    // Function to update the graph based on selected subjects
    function updateGraph(selectedSubjects) {
        // Ensure selectedSubjects is an array
        if (!Array.isArray(selectedSubjects)) {
            selectedSubjects = [];
        }

        g.nodes().forEach(node => g.removeNode(node));
        g.edges().forEach(edge => g.removeEdge(edge.v, edge.w));

        const filteredCourses = coursesData.filter(course =>
            selectedSubjects.some(subject => course.course_code.startsWith(subject))
        );

        filteredCourses.forEach(function(course) {
            g.setNode(course.course_code, { label: course.course_code, id: course.course_code });
        });

        filteredCourses.forEach(function(course) {
            if (course.prerequisites.length > 0) {
                course.prerequisites.forEach(function(prereq) {
                    if (filteredCourses.some(c => c.course_code === prereq)) {
                        g.setEdge(prereq, course.course_code, { label: "", curve: d3.curveBasis, arrowheadStyle: "fill: #000" });
                    }
                });
            }
            if (course.corequisites.length > 0) {
                course.corequisites.forEach(function(coreq) {
                    if (filteredCourses.some(c => c.course_code === coreq)) {
                        g.setEdge(coreq, course.course_code, { label: "", style: "stroke: coral; stroke-dasharray: 5, 5;",
                                                               curve: d3.curveBasis, arrowheadStyle: "fill: coral" });
                    }
                });
            }
        });

        d3.select("svg g").remove(); // Remove previous graph
        renderGraph(); // Render updated graph
    }

    updateGraph(subjects); // Initial graph rendering with no subject filter

    // Function to filter courses based on keywords in the description
    function filterCoursesByKeywords(keywords) {
        if (!keywords) return [];

        const keywordArray = keywords.split(',').map(keyword => keyword.trim().toLowerCase());
        
        return coursesData.filter(course => 
            keywordArray.some(keyword => 
                course.description.toLowerCase().includes(keyword)
            )
        );
    }

    // Add event listener for the search button
    document.getElementById("searchButton").addEventListener('click', function() {
        const keywords = document.getElementById("keywordInput").value.trim(); // Trim whitespace
        if (!keywords) return; // If the input is empty, do nothing

        const filteredCourses = filterCoursesByKeywords(keywords);

        // Clear previous graph nodes and edges
        g.nodes().forEach(node => g.removeNode(node));
        g.edges().forEach(edge => g.removeEdge(edge.v, edge.w));

        // Add filtered courses to the graph
        filteredCourses.forEach(function(course) {
            g.setNode(course.course_code, { label: course.course_code, id: course.course_code });
        });

        filteredCourses.forEach(function(course) {
            if (course.prerequisites.length > 0) {
                course.prerequisites.forEach(function(prereq) {
                    if (filteredCourses.some(c => c.course_code === prereq)) {
                        g.setEdge(prereq, course.course_code, { label: "", curve: d3.curveBasis, arrowheadStyle: "fill: #000" });
                    }
                });
            }
            if (course.corequisites.length > 0) {
                course.corequisites.forEach(function(coreq) {
                    if (filteredCourses.some(c => c.course_code === coreq)) {
                        g.setEdge(coreq, course.course_code, { label: "", style: "stroke: coral; stroke-dasharray: 5, 5;", curve: d3.curveBasis, arrowheadStyle: "fill: coral" });
                    }
                });
            }
        });

        d3.select("svg g").remove(); // Remove previous graph
        renderGraph(); // Render updated graph
    });

    function showInitialMessage() {
        const svg = d3.select("svg");
        // Check if the initial message already exists
        const initialMessage = svg.select("#initialMessage");
        
        if (initialMessage.empty()) {
            // If it doesn't exist, create it
            svg.append("text")
                .attr("id", "initialMessage")
                .attr("x", "50%")                         
                .attr("y", "50%")                         
                .attr("dy", ".35em")                      
                .attr("text-anchor", "middle")           
                .style("font-size", "60px")              
                .style("fill", "#8B8378")                  
                .style("pointer-events", "none")
                .style("font-family", "Arial, sans-serif") // Use a more modern font
                .style("font-weight", "bold") // Make the text bold  
                .style("filter", "url(#text-shadow)")       
                .text("Filter Courses from the sidebar"); 
        } else {
            // If it exists, make it visible
            initialMessage.style("display", "block");
        }
    }    

    // Add event listener for reset button
    document.getElementById("resetButton").addEventListener('click', function() {
        selectedSubjects = []; // Clear selected subjects
        dropdownButton.textContent = `Select Subjects (0/3)`; // Update button text

        // Uncheck all checkboxes in the dropdown
        const checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false; // Uncheck each checkbox
        });
        
        // Clear the input text box
        document.getElementById("keywordInput").value = ""; // Clear input text box

        document.getElementById("dialog").style.display = "none";

        updateGraph(subjects); // Reset graph
    });

    document.getElementById("close-dialog").onclick = function() {
        document.getElementById("dialog").style.display = "none";
    };

}).catch(error => console.error('Error loading the JSON:', error));
