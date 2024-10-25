function adjustSVGSize() {
    const svg = document.getElementById("mySVG");
    const mainDiv = document.getElementById("main");

    if (mainDiv) { // Check if the mainDiv exists
        // Get main div dimensions
        const mainWidth = mainDiv.clientWidth;
        const mainHeight = mainDiv.clientHeight;

        // Set SVG dimensions
        svg.setAttribute("width", mainWidth);
        svg.setAttribute("height", mainHeight);
    } else {
        console.warn("Element with ID 'main' not found. SVG size adjustment will be skipped.");
    }
}

if (window.location.pathname.includes("index.html")) {
    // Call the function on page load
    window.onload = adjustSVGSize;

    // Adjust SVG size on window resize
    window.onresize = adjustSVGSize;
} else if (window.location.pathname.includes("redirect.html")) {
    // You can add any specific logic for redirect.html here if needed
    console.log("Currently on redirect.html. No SVG size adjustment required.");
}

// Create initial message text in the SVG
const svg = d3.select("#mySVG");

d3.json('all_courses.json').then(coursesData => {
    const subjects = [...new Set(coursesData.map(course => course.course_code.slice(0, 4)))];
    const themes = [...new Set(coursesData.flatMap(course => course.themes))];
    const levels = [...new Set(coursesData.map(course => course.course_code.slice(5,6)*100))]
                    .sort((a, b) => a - b)
                    .map(level => `${level} level`);

    if (window.location.pathname.includes("index.html")) {
        
        const dropdownButton = document.getElementById("dropdownButton");
        const dropdownContent = document.getElementById("dropdownContent");

        const themesDropdownButton = document.getElementById("dropdownButton-2");
        const themesDropdownContent = document.getElementById("dropdownContent-2");

        const levelsDropdownButton = document.getElementById("dropdownButton-3");
        const levelsDropdownContent = document.getElementById("dropdownContent-3");

        let selectedSubjects = [];
        let selectedThemes = [];
        let selectedLevel = [];

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
                updateGraph(selectedSubjects, selectedThemes, selectedLevel); // Update graph based on selections
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(subject));
            dropdownContent.appendChild(label);
        });

        // Populate the dropdown with checkbox options
        themes.forEach(theme => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = theme;

            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    // Uncheck other checkboxes if this one is checked
                    const checkboxes = themesDropdownContent.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        if (cb !== this) {
                            cb.checked = false; // Uncheck all other checkboxes
                        }
                    });
                    // Update the selected theme
                    selectedThemes = [this.value]; // Set the selected theme
                } else {
                    selectedThemes = []; // Clear selected theme
                }

                // Update button text based on selection
                if (selectedThemes.length > 0) {
                    themesDropdownButton.textContent = `Selected Theme: ${selectedThemes[0]}`;
                } else {
                    themesDropdownButton.textContent = "Select Theme"; // Reset button text when no theme is selected
                }

                // Update the graph based on the new selection
                updateGraph(selectedSubjects, selectedThemes, selectedLevel);
            });

            // Append the checkbox and label to the dropdown
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(theme));
            themesDropdownContent.appendChild(label);
        });

        // Populate the dropdown with checkbox options
        levels.forEach(level => {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = level;

            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    // Uncheck other checkboxes if this one is checked
                    const checkboxes = levelsDropdownContent.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        if (cb !== this) {
                            cb.checked = false; // Uncheck all other checkboxes
                        }
                    });
                    // Update the selected theme
                    selectedLevel = [this.value]; // Set the selected theme
                } else {
                    selectedLevel = []; // Clear selected theme
                }

                // Update button text based on selection
                if (selectedLevel.length > 0) {
                    levelsDropdownButton.textContent = `Selected Level: ${selectedLevel[0]}`;
                } else {
                    levelsDropdownButton.textContent = "Select Course Level"; // Reset button text when no theme is selected
                }

                // Update the graph based on the new selection
                updateGraph(selectedSubjects, selectedThemes, selectedLevel);
            });

            // Append the checkbox and label to the dropdown
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(level));
            levelsDropdownContent.appendChild(label);
        });

        // Toggle dropdown display
        dropdownButton.addEventListener('click', function() {
            dropdownContent.classList.toggle("show");
        });

        themesDropdownButton.addEventListener('click', function() {
            themesDropdownContent.classList.toggle("show");
        });

        levelsDropdownButton.addEventListener('click', function() {
            levelsDropdownContent.classList.toggle("show");
        });

        // Close dropdown if clicked outside the button and content
        document.addEventListener('click', function(event) {
            const isClickInsideButton = dropdownButton.contains(event.target);
            const isClickInsideContent = dropdownContent.contains(event.target);

            if (!isClickInsideButton && !isClickInsideContent) {
                dropdownContent.classList.remove("show");
            }
        });

        document.addEventListener('click', function(event) {
            const isClickInsideButton = themesDropdownButton.contains(event.target);
            const isClickInsideContent = themesDropdownContent.contains(event.target);

            if (!isClickInsideButton && !isClickInsideContent) {
                themesDropdownContent.classList.remove("show");
            }
        });

        document.addEventListener('click', function(event) {
            const isClickInsideButton = levelsDropdownButton.contains(event.target);
            const isClickInsideContent = levelsDropdownContent.contains(event.target);

            if (!isClickInsideButton && !isClickInsideContent) {
                levelsDropdownContent.classList.remove("show");
            }
        });
    }

    // Create a new directed graph
    var g = new dagreD3.graphlib.Graph().setGraph({
        rankdir: 'TB',
        nodesep: 10,
        edgesep: 0,
        ranksep: 150
    });

    // Function to render the graph
    function renderGraph(filteredCourseIds) {
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

        var initialScale = 0.7;
        var offset = 0;
        var graphWidth = g.graph().width || 0;  // Default to 0 if undefined
        var graphHeight = g.graph().height || 0;

        if (graphWidth > 0) {
            svg.call(zoom.transform, d3.zoomIdentity
                .translate((svg.attr("width") - graphWidth * initialScale) / 2 - offset, 30)
                .scale(initialScale)
            );
        } else {
            // Fallback positioning if the graph width is 0 or undefined
            svg.call(zoom.transform, d3.zoomIdentity.scale(initialScale));
        }

        inner.selectAll("g.node").on("click", function(event, d) {
            const course = coursesData.find(course => course.course_code === d);
            if (course) {
                // Optional: Store course information in local storage or pass it as query parameters if needed
                localStorage.setItem("selectedCourse", JSON.stringify(course));
                // Redirect to redirect.html
                window.location.href = 'redirect.html';
            }
        });

        // Apply color to nodes based on filtered course IDs
        inner.selectAll("g.node").select("rect")
            .style("fill", function(d) {
                return filteredCourseIds.includes(d) ? "#EEDFCC" : null;
            });

        // Mouseover: make edges of prerequisites and corequisites higher opacity, others lower
        inner.selectAll("g.node").on("mouseover", function(event, d) {
            const course = coursesData.find(course => course.course_code === d);

            // Make the hovered node bold and full opacity
            d3.select(this).select("rect").style("fill", function() {
                return filteredCourseIds.includes(d) ? "#EEDFCC" : "cyan";
            });
            d3.select(this).select("text").style("font-weight", "bold");
            d3.select(this).style("opacity", 1);

            // Reduce opacity of all other nodes and edges
            inner.selectAll("g.node").filter(n => n !== d).style("opacity", 0.2);
            inner.selectAll("g.edgePath").style("opacity", 0.2);

            // Highlight prerequisites and corequisites
            if (course && course.prerequisites.length > 0) {
                course.prerequisites.forEach(function(prereq) {
                    // Highlight node
                    inner.select(`g.node[id="${prereq}"]`).select("rect").style("fill", "cyan");
                    inner.select(`g.node[id="${prereq}"]`).select("text").style("font-weight", "bold");
                    inner.select(`g.node[id="${prereq}"]`).style("opacity", 1);

                    // Make edge to prerequisite higher opacity
                    inner.select(`g.edgePath[id*="${d+prereq}"]`).style("opacity", 1)
                    .select("path")
                    .style("stroke-width", "3px")
                    .style("stroke", "black");
                });
            }

            if (course && course.corequisites.length > 0) {
                course.corequisites.forEach(function(coreq) {
                    // Highlight node
                    inner.select(`g.node[id="${coreq}"]`).select("rect").style("fill", "coral");
                    inner.select(`g.node[id="${coreq}"]`).select("text").style("font-weight", "bold");
                    inner.select(`g.node[id="${coreq}"]`).style("opacity", 1);

                    // Make edge to corequisite higher opacity
                    inner.select(`g.edgePath[id*="${d+coreq}"]`).style("opacity", 1)
                    .select("path")
                    .style("stroke-width", "3px")
                    .style("stroke", "coral")
                    .style("stroke-dasharray", "5, 5");
                });
            }
        });

        // Mouseout: reset styles for all nodes and edges
        inner.selectAll("g.node").on("mouseout", function(event, d) {
            const course = coursesData.find(course => course.course_code === d);

            // Reset hovered node style
            d3.select(this).select("rect").style("fill", function() {
                return filteredCourseIds.includes(d) ? "#EEDFCC" : null;
            });
            d3.select(this).select("text").style("font-weight", null);
            d3.select(this).style("opacity", 1);

            // Reset opacity for all nodes and edges
            inner.selectAll("g.node").style("opacity", 1);
            inner.selectAll("g.edgePath").style("opacity", 1);

            if (course) {
                // Reset styles for prerequisites
                course.prerequisites.forEach(function(prereq) {
                    inner.select(`g.node[id="${prereq}"]`).select("rect").style("fill", function() {
                        return filteredCourseIds.includes(prereq) ? "#EEDFCC" : null;
                    });
                    inner.select(`g.node[id="${prereq}"]`).select("text").style("font-weight", null);
                    inner.select(`g.edgePath[id*="${d+prereq}"]`).style("opacity", 1)
                    .select("path")
                    .style("stroke-width", "1.5px")
                    .style("stroke", "black");
                });

                // Reset styles for corequisites
                course.corequisites.forEach(function(coreq) {
                    inner.select(`g.node[id="${coreq}"]`).select("rect").style("fill", function() {
                        return filteredCourseIds.includes(coreq) ? "#EEDFCC" : null;
                    });
                    inner.select(`g.node[id="${coreq}"]`).select("text").style("font-weight", null);
                    inner.select(`g.edgePath[id*="${d+coreq}"]`).style("opacity", 1)
                    .select("path")
                    .style("stroke-width", "1.5px")
                    .style("stroke", "coral")
                    .style("stroke-dasharray", "5, 5");
                });
            }
        });
    }

    // Function to update the graph based on selected subjects and themes
    function updateGraph(selectedSubjects, selectedThemes, selectedLevel) {
        // Ensure selectedSubjects and selectedThemes are arrays
        if (!Array.isArray(selectedSubjects)) {
            selectedSubjects = [];
        }
        if (!Array.isArray(selectedThemes)) {
            selectedThemes = [];
        }
        if (!Array.isArray(selectedLevel)) {
            selectedThemes = [];
        }

        // Clear existing nodes and edges from the graph
        g.nodes().forEach(node => g.removeNode(node));
        g.edges().forEach(edge => g.removeEdge(edge.v, edge.w));

        // If no subjects or themes are selected, don't render the graph, show the initial message
        if (selectedSubjects.length === 0 && selectedThemes.length === 0 && selectedLevel.length=== 0) {
            d3.select("svg g").remove(); // Clear the graph
            showInitialMessage(); // Show initial message or placeholder
            return; // Exit the function early
        }

        // Filter courses based on selected subjects and themes
        const filteredCourses = coursesData.filter(course =>
            (selectedSubjects.length === 0 || selectedSubjects.some(subject => course.course_code.startsWith(subject))) && // Filter by subjects
            (selectedThemes.length === 0 || selectedThemes.some(theme => course.themes.includes(theme))) && // Filter by themes
            (selectedLevel.length === 0 || selectedLevel.includes(`${course.course_code.charAt(5) * 100} level`))
        );

        // Add filtered courses as nodes to the graph
        filteredCourses.forEach(function(course) {
            g.setNode(course.course_code, { label: course.course_code, id: course.course_code });
        });

        // Add prerequisite and corequisite edges between the nodes
        filteredCourses.forEach(function(course) {
            // Add prerequisites edges
            if (course.prerequisites.length > 0) {
                course.prerequisites.forEach(function(prereq) {
                    if (filteredCourses.some(c => c.course_code === prereq)) {
                        g.setEdge(prereq, course.course_code, { label: "", id: course.course_code+prereq, curve: d3.curveBasis, arrowheadStyle: "fill: #000" });
                    }
                });
            }
            // Add corequisites edges
            if (course.corequisites.length > 0) {
                course.corequisites.forEach(function(coreq) {
                    if (filteredCourses.some(c => c.course_code === coreq)) {
                        g.setEdge(coreq, course.course_code, { label: "", id: course.course_code+coreq, style: "stroke: coral; stroke-dasharray: 5, 5;",
                                                            curve: d3.curveBasis, arrowheadStyle: "fill: coral" });
                    }
                });
            }
        });

        // Store filtered course IDs
        const filteredCourseIds = filteredCourses.map(course => course.course_code);

        // Clear previous graph rendering and render updated graph
        d3.select("svg g").remove();
        renderGraph(filteredCourseIds); // Pass filtered course IDs for color application
    }

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
    if (window.location.pathname.includes("index.html")) {

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
    }

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

    if (window.location.pathname.includes("index.html")) {

        const dropdownButton = document.getElementById("dropdownButton");
        const dropdownContent = document.getElementById("dropdownContent");

        const themesDropdownButton = document.getElementById("dropdownButton-2");
        const themesDropdownContent = document.getElementById("dropdownContent-2");

        const levelsDropdownButton = document.getElementById("dropdownButton-3");
        const levelsDropdownContent = document.getElementById("dropdownContent-3");
        
    // Add event listener for reset button
        document.getElementById("resetButton").addEventListener('click', function() {
            selectedSubjects = []; // Clear selected subjects
            selectedThemes = [];
            selectedLevel = [];
            dropdownButton.textContent = `Select Subjects (0/3)`; // Update button text
            themesDropdownButton.textContent = 'Select Theme'
            levelsDropdownButton.textContent = 'Select Course Level'


            // Uncheck all checkboxes in the dropdown
            const checkboxes = dropdownContent.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false; // Uncheck each checkbox
            });

            // Uncheck all checkboxes in the dropdown
            const checkboxes_2 = themesDropdownContent.querySelectorAll('input[type="checkbox"]');
            checkboxes_2.forEach(checkbox => {
                checkbox.checked = false; // Uncheck each checkbox
            });

            const checkboxes_3 = levelsDropdownContent.querySelectorAll('input[type="checkbox"]');
            checkboxes_3.forEach(checkbox => {
                checkbox.checked = false; // Uncheck each checkbox
            });
            
            // Clear the input text box
            document.getElementById("keywordInput").value = ""; // Clear input text box

            document.getElementById("dialog").style.display = "none";

            updateGraph(selectedSubjects, selectedThemes, selectedLevel); // Reset graph

            // Show the initial message again
            showInitialMessage(); // Call the function to show the message
        });

        document.getElementById("close-dialog").onclick = function() {
            document.getElementById("dialog").style.display = "none";
        };
    }

}).catch(error => console.error('Error loading the JSON:', error));