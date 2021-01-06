/*
Plan:

Structures:
	Draw a Circle in the center. This will be the wheel axle.
	Draw a Polygon (triangele) above the Circle/axle. This will be the pointer.
	Draw each Sectors using <path>
	Arrow buttons using Div on the each side of the svg to Rotate (not Spin) the wheel.

Functions:
	Divide the wheel into n equal sectors (to be determined by user's input). Default is 2 sectors.
	(Animate) Spin the wheel for a certain time (to be determined by user's input). Default is ~6 seconds.	
	Pointer can never be in between the sectors.

Polishing:
	Wheel sectors can be of different colors. This can be changed by through user's input.
	Wheel spin's speed should be realistic: Quick spin at the beginning then slowly stop at the end.
	User can choose where to start the spin. There should be an option to rotate the wheel before spinning.
	Add spin time countdown.
*/

/*
To do:
	DONE: add buttons (can be divs around the svg) to rotate wheel before spin
	DONE: Restrict range of end angle so the pointer cannot fall in between sectors
	DONE: Disable Wheel Config while spinning
		Problem: Multiple Spin causes the wheel config to be prematurely available.
		Compromise: Disable Multiple Spin.
	Add texts capability on sectors.
*/

const MAINSVG = document.querySelector("#main-svg");
const SVGWIDTH = MAINSVG.getAttribute("width");
const SVGHEIGHT = MAINSVG.getAttribute("height");

const SPINBTN = document.querySelector("#spin-btn");
const CONFIGBTN = document.querySelector("#config-btn");
const ROTATELEFTBTN = document.querySelector("#left-btn");
const ROTATERIGHTBTN = document.querySelector("#right-btn");

const SECTORSINPUT = document.querySelector("#numberOfSectors");
const DURATIONINPUT = document.querySelector("#spinTime");
const ROTATIONWEIGHTINPUT = document.querySelector("#rotateWeight");

const CONFIGDIV = document.querySelector("#config-view");


const drawCircle = (id, cx, cy, r, fill, parentId, stroke, strokeWidth, onclick) => {
	let newCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	newCircle.setAttribute("id", id || `circle${document.querySelectorAll("circle").length}`);
	newCircle.setAttribute("cx", cx || SVGWIDTH/2);
	newCircle.setAttribute("cy", cy || SVGHEIGHT/2);
	newCircle.setAttribute("r", r || (SVGWIDTH/3));
	newCircle.setAttribute("fill", fill || "black");
	newCircle.setAttribute("stroke", stroke || "white");
	newCircle.setAttribute("stroke-width", strokeWidth || 4);

	//Append to #main-svg or the specified parent
	let parentSVG = document.querySelector(`#${parentId}`) || MAINSVG;
	parentSVG.appendChild(newCircle);
}

//svg text
const addText = (id, parentId, x, y, dx, dy, rotate, textLength, fontFamily, fontSize, 	fill, stroke, strokeWidth) => {
	let newText = document.createElementNS("http://www.w3.org/2000/svg", "text");
	newText.setAttribute("id", id || `text${document.querySelectorAll("text").length}`);
	newText.setAttribute("x", x || SVGWIDTH/2);
	newText.setAttribute("y", y || SVGHEIGHT/2);
	newText.setAttribute("dx", dx || SVGWIDTH/2);
	newText.setAttribute("dy", dy || SVGHEIGHT/2);

	newText.setAttribute("rotate", rotate || "white");
	newText.setAttribute("textLength", textLength || "white");
	newText.setAttribute("fontFamily", fontFamily || "white");
	newText.setAttribute("fontSize", fontSize || "white");
	newText.setAttribute("fill", fill || "white");
	newText.setAttribute("stroke", stroke || "white");
	newText.setAttribute("stroke-width", strokeWidth || 4);
	//Append to #main-svg or the specified parent
	let parentSVG = document.querySelector(`#${parentId}`) || MAINSVG;
	parentSVG.appendChild(newText);
}

//For pointer purposes
const drawPolygon = (points, fill, stroke, strokeWidth, parentId) => {
	let newPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
	newPolygon.setAttribute("points", points || `${(SVGWIDTH/2) - 25},${(SVGHEIGHT/2)} ${(SVGWIDTH/2)},${(SVGHEIGHT/2) - 100} ${(SVGWIDTH/2) + 25},${(SVGHEIGHT/2)}`);
	newPolygon.setAttribute("fill", fill || "white");
	newPolygon.setAttribute("stroke", stroke || "none");
	newPolygon.setAttribute("strokeWidth", strokeWidth || 2);
	//Append to #main-svg or the specified parent
	let parentSVG = document.querySelector(`#${parentId}`) || MAINSVG;
	parentSVG.appendChild(newPolygon);
};

//Color Picker value must be in seven-character hexadecimal notation.
const rgbToHex = (rgbArr) => {
	let converted = "#" + rgbArr.map(x => {
	  const hex = x.toString(16)
	  return hex.length === 1 ? "0" + hex : hex
	}).join("")
	return converted;
};

const insertColorPicker = (sectorId, id, initialValue) => {
	let newColorInput = document.createElement("input");
	newColorInput.setAttribute("type", "color");
	newColorInput.setAttribute("id", id || `colorInput${document.querySelectorAll("input[type='color']").length}`);
	newColorInput.setAttribute("class", "colorPicker");
	
	let sector = document.querySelector(`#${sectorId}`);
	//Set attribute doesn't work here.
	let sectorFill = sector.getAttribute("fill");
	//remove "rgb(...)" part
	sectorFill = sectorFill.slice(4, sectorFill.length - 1);
	sectorFill =  sectorFill.split(",").map(x => parseInt(x.replace(/\s/g, "")));
	//console.log("sector Fill stripped and split: ", sectorFill);

	newColorInput.setAttribute("value", initialValue || rgbToHex(sectorFill));
	newColorInput.addEventListener("input", e => {
		e.preventDefault();

		//using e.value only (without the "target") doesn't work as we want to
		sector.setAttribute("fill", e.target.value);
	});

	document.querySelector("#color-inputs").appendChild(newColorInput);
};

const animateTransformSVG = (xlink, degree, startSpin, attributeType, attributeName, type, from, to, dur, calcMode, keyTimes, keySplines, repeatCount, begin, fill) => {
	let animate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
	animate.setAttribute("xlink:href", `#${xlink}` || `#${document.querySelectorAll("path")[0].id}`);
	animate.setAttribute("attributeType", attributeType || "transform");
	animate.setAttribute("attributeName", attributeName || "transform");
	animate.setAttribute("type", type || "rotate");

	//value is expressed as <rotate-angle> [<cx> <cy>]
	animate.setAttribute("from", from || `0 ${SVGWIDTH/2} ${SVGHEIGHT/2}`);

	//the end position should be random.
	animate.setAttribute("to", to || `${degree || 360} ${SVGWIDTH/2} ${SVGHEIGHT/2}`);
	animate.setAttribute("dur", dur || "6s");

	animate.setAttribute("repeatCount", repeatCount || 1);
	animate.setAttribute("begin", begin || "indefinite");
	animate.setAttribute("fill", fill || "freeze");

	//Manipulate speed to mimic real spins.
	//cool

	animate.setAttribute("calcMode", calcMode || "spline");
	animate.setAttribute("keyTimes", keyTimes || "0; 1");
	animate.setAttribute("keySplines", keySplines || "0 1 .01 1");
	//if (startSpin) {
	//}
	

	let parentSVG = document.querySelector(`#${xlink}`) || MAINSVG;//document.querySelector(`#${xlink}`) || document.querySelectorAll("path")[0];
	parentSVG.appendChild(animate);
}

//The values on the interval are inclusive.
const generateRandomNumber = (min, max) => {
  min = Math.ceil(min || 0);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};

//The return value of this function will be added to the wheel's current degree of rotation.
const generateRandomDegree = (slices, initialAngle) => {
	/*
	To do:
		The pointer should not fall on the middle of any 2 sectors.
		Restrict the domain so the range will not be a multiple of each sector's terminal angles.
		Idea: Since the path sectors start at 0 degrees, the 1st sector's terminal angle is at 360/n.
			n is the number of slices. 0 degree the terminal angle's multiples are restricted.
		Problem: If the user adjusts the wheel before spin, the initial angle, and therefore the terminal angle will adjust, too.
		Possible Solution: Add initial angle parameter for reference.
	*/
	let degree = initialAngle;
	//Random degree should not be the initial angle or a multiple of a sector's terminal angle.
	//The terminal angle is now initial angle + (360/slices)
	//The degree is a multiple of a sector's terminal angle if degree % initial angle + (360/n) == 0. n is the number of slices.
	while (degree == initialAngle || degree % initialAngle + (360/slices) == 0) {
		degree = generateRandomNumber(1, 359);
	};
	return degree;
};

const drawWheel = (slices, cx, cy, r = 200, fill, parentId, stroke, strokeWidth) => {
	//Fallback when user inputs a number lower than 1 and/or not an integer.
	if ((!r || r == 0)  || (!slices || slices < 1) || slices % 1 != 0) {
		//default blank circle;
		drawCircle(null, null, null, r);
		return;
	}

	for (var i = 0; i < slices; i++) {
		let newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
		let id =  `path${document.querySelectorAll("path").length}`;
		newPath.setAttribute("id", id);
		newPath.setAttribute("fill", fill || `rgb(${generateRandomNumber(0, 255)}, ${generateRandomNumber(0, 255)}, ${generateRandomNumber(0, 255)})`);
		newPath.setAttribute("stroke", stroke || "none");
		newPath.setAttribute("strokeWidth", strokeWidth || 1);

		//Initial angle of current sector
	    let fromAngle = i * 360 / (slices || 2);
	    //Terminal angle of current sector
	    let toAngle = (i + 1) * 360 / (slices || 2);


	    let fromAbscissaX = cx + (r * Math.cos(fromAngle * Math.PI / 180));
	    let fromOrdinateY = cy + (r * Math.sin(fromAngle * Math.PI / 180));
	    let toAbscissaX = cx + (r * Math.cos(toAngle * Math.PI / 180));
	    let toOrdinateY = cy + (r * Math.sin(toAngle * Math.PI / 180));
	    
	    /*
			M: Move to
			L: Line to
			A: Arc
				rX, rY (rotation)
			z: Straight line back to the start of the path
	    */

	    let d = `M${cx},${cy} L${fromAbscissaX},${fromOrdinateY} A${r},${r}, 0 0,1 ${toAbscissaX},${toOrdinateY}z`;
	    
	    newPath.setAttribute("d", d);
	    

	    let parentSVG = document.querySelector(`#${parentId}`) || MAINSVG;
		parentSVG.appendChild(newPath);

		animateTransformSVG(id);

		
		let animatePath = document.querySelector(`#${id}`);


		//insert color picker for each sector.
		//check if sector already exists by now.
		//console.log(document.querySelector(`path${document.querySelectorAll("path").length}`)); 
		insertColorPicker(id || `path${document.querySelectorAll("path").length}`);
  	}
	
	//Pointer
	drawPolygon()
	//Wheel axle:
	drawCircle("axle", null, null, r/8);
};

let btnWeight = ROTATIONWEIGHTINPUT.value;
let isSpinning = false;

ROTATIONWEIGHTINPUT.addEventListener("change", e => {
	e.preventDefault();
	//check if change value is within accepted range, which is [1, +infty)
	if (e.target.value < 1) {
		e.target.value = 5;
		return;
	};
});

ROTATIONWEIGHTINPUT.addEventListener("change", e => {
	e.preventDefault();
	btnWeight = e.target.value;
});

//Find the smallest coterminal angle between 0 and 360 degrees.
//Use this to set the attribute of the current "from"
const findCoterminalAngle = (angle) => {
	let currentAngle = angle;

	//check if angle is positive or not
	//if angle is positive, the conditional should be currentAngle  > 360
	//if angle is negative, the conditional should be currentAngle  < 0
	if (currentAngle > 360) {
		while (currentAngle > 360) {
			currentAngle -= 360
		};
		return currentAngle;
	}	else {
		while (currentAngle < 0) {
			currentAngle += 360
		};
		return currentAngle;
	}
	
};

//add eventlister for wheel rotator buttons.
//Only clickable before the spin.
ROTATELEFTBTN.addEventListener("click", e => {
	//Disable wheel configuration and wheel rotation arrows.
	if (isSpinning) {
		return;
	}
	e.preventDefault();
	let sectorPaths = document.querySelectorAll("animateTransform");
	sectorPaths.forEach(sector => {
		//This has 3 values. The first value is the rotation.
		let currentTo = sector.getAttribute("from").split();
		//btnWeight is read as string. So, we need to make it an int.
		let currentPosition = `${(parseInt(currentTo[0])-parseInt(btnWeight))} ${SVGWIDTH/2} ${SVGHEIGHT/2}`;
		sector.setAttribute("to", currentPosition);
		sector.setAttribute("from", currentPosition)
		sector.setAttribute("dur", "0.5s");
		sector.beginElement();
		//console.log(currentTo);
	});
	//console.log(sectorPaths);
});

ROTATERIGHTBTN.addEventListener("click", e => {
	//Disable wheel configuration and wheel rotation arrows.
	if (isSpinning) {
		return;
	}
	e.preventDefault();
	let sectorPaths = document.querySelectorAll("animateTransform");
	sectorPaths.forEach(sector => {
		//This has 3 values. The first value is the rotation.
		let currentTo = sector.getAttribute("from").split();
		//btnWeight is read as string. So, we need to make it an int.
		let currentPosition = `${(parseInt(currentTo[0])+parseInt(btnWeight))} ${SVGWIDTH/2} ${SVGHEIGHT/2}`;
		sector.setAttribute("to", currentPosition);
		sector.setAttribute("from", currentPosition)
		sector.setAttribute("dur", "0.5s");
		sector.beginElement();
		//console.log(currentTo);
	});
});

DURATIONINPUT.addEventListener("change", e => {
	e.preventDefault();
	//check if spin value is within accepted range, which is [1,60]
	if (DURATIONINPUT.value < 1 || DURATIONINPUT.value > 60) {
		DURATIONINPUT.value = 6;
		return;
	};
})
const spinWheel = () => {
	isSpinning = true;
	let spinDur = parseInt(DURATIONINPUT.value);
	//Start countdown
	countdown(spinDur, "spin-btn");

	let sectorPaths = document.querySelectorAll("animateTransform");
	let slices = sectorPaths.length;
	//initial random degree
	//Change if the user rotates the wheel before spin.
	//We can use the first slice as reference.
	let refSlice = sectorPaths[0].getAttribute("from").split()
	let degree = generateRandomDegree(slices, parseInt(refSlice[0]));

	let forShowRotationN = 100;

	sectorPaths.forEach(sector => {
		//Spin from what degree it's currently in.
		let currentFrom = sector.getAttribute("to");
		sector.setAttribute("from", `${findCoterminalAngle((parseInt(currentFrom[0])))} ${SVGWIDTH/2} ${SVGHEIGHT/2}`);
		//So, the degree of rotation is already decided.
		//The number of 360 * n is just for show lol
		//Seriously, it's for the pseudo-realistic effect of multiple rotation as effect of the spin. 
		sector.setAttribute("to", `${degree+(360*forShowRotationN)} ${SVGWIDTH/2} ${SVGHEIGHT/2}`);
		sector.setAttribute("dur", `${spinDur}s` || "20s");

		sector.beginElement();
		//console.log("Spin now");

		//Adjust the from again so it starts here next spin/rotation.
		sector.setAttribute("from", `${findCoterminalAngle(degree+(360*forShowRotationN))} ${SVGWIDTH/2} ${SVGHEIGHT/2}`);
		
	});
	//Disable Wheel color changing while Wheel is spinning.
	let colorPickersInput = document.querySelectorAll("input[type='color']");
	colorPickersInput.forEach(colorPicker => {
		colorPicker.disabled = true;
	});
};


SECTORSINPUT.addEventListener("change", e => {
	e.preventDefault();
	//check if change value is within accepted range, which is [2,359]
	if (e.target.value < 2 || e.target.value > 359) {
		e.target.value = 2;
		return;
	};
	//Delete previous wheel before drawing a new one.
	//Also delete the previous color pickers
	let colorPickersAside = document.getElementById("color-inputs");
	while(colorPickersAside.firstChild) {
		colorPickersAside.removeChild(colorPickersAside.firstChild);
	};
	while(MAINSVG.firstChild) {
		MAINSVG.removeChild(MAINSVG.firstChild);
	};

	drawWheel(e.target.value, 250, 250, 200);
	//SPINBTN.disabled = false;
});

//Add eventListener for the Spin button.
//When Spin button is pressed, the wheel rotates.
SPINBTN.addEventListener("click", e => {
	e.preventDefault();
	//Disable wheel configuration.
	CONFIGBTN.disabled = true;

	CONFIGDIV.style.display = "none";
	CONFIGBTN.textContent = "Wheel configuration becomes available after spin.";
	CONFIGBTN.style.backgroundColor = "gray";
	
	CONFIGBTN.style.cursor = "wait";
	CONFIGBTN.style.cursor = "wait";
	ROTATERIGHTBTN.style.cursor = "wait";
	ROTATELEFTBTN.style.cursor = "wait";
	e.target.style.cursor = "wait";

	e.target.textContent = `Time left: ${DURATIONINPUT.value}`;

	spinWheel();

	e.target.disabled = true;

	
	setTimeout(() => {
		//Enable Wheel color changing after Wheel spin.
		let colorPickersInput = document.querySelectorAll("input[type='color']");
		colorPickersInput.forEach(colorPicker => {
			colorPicker.disabled = false;
		});
		//Enable buttons again.
		CONFIGBTN.disabled = false;
		CONFIGBTN.textContent = "Configure Wheel";
		CONFIGBTN.style.backgroundColor = "black";
		CONFIGBTN.style.cursor = "grab";
		ROTATERIGHTBTN.style.cursor = "grab";
		ROTATELEFTBTN.style.cursor = "grab";
		e.target.style.cursor = "grab";
		e.target.disabled = false;
		element.textContent = `Spin!`;
		isSpinning = false;

	}, (parseInt(DURATIONINPUT.value)+ 1) * 1000);
});

//When configure button is click, disable Spin! button and default axle spin behavior.
CONFIGBTN.addEventListener("click", e => {
	e.preventDefault();
	if (CONFIGDIV.style.display != "none") {
		CONFIGDIV.style.display = "none";
		CONFIGBTN.textContent = "Open Wheel Configuration";
	}	else {
		CONFIGDIV.style.display = "flex";
		CONFIGBTN.textContent = "Close Wheel Configuration";
	}
});

const countdown = (dur, elementId) => {
	duration = dur;
	element = document.getElementById(elementId);
	if (element && duration >= 0) {
		let count = setInterval(() => {
			//Ensure that time won't be negative.
			if ((duration) < 0) {
				return;
			}
			element.textContent = `Time left: ${duration - 1}`;
			console.log("Countdown:", duration);
			duration--;
		}, 1000);
		setTimeout(() => {
			clearInterval(count);
		}, (duration) * 1000);
	};
};

//Default wheel
drawWheel(2, 250, 250, 200);