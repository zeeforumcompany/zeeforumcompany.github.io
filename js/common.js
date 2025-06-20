var globalFailedRequestsData = [];
var globalSuccessRequestsData = [];

// Copy json text area value to clipboard
var copyBtn = document.getElementById('copy');

if (copyBtn) {
	copyBtn.addEventListener('click', function() {
		// Select Textarea by ID
		var jsonTextarea = document.getElementById('json');
		jsonTextarea.select();

		// Copy textarea value to clipboard
		document.execCommand('copy');
	});
}

var toggle = document.querySelector('.toggle');
if (toggle) {
	toggle.addEventListener('click', function() {
		var toggleElement = toggle.getAttribute('data-toggle');
		var toggleElementToShow = document.getElementById(toggleElement);
		if (toggleElementToShow) {
			if (toggleElementToShow.classList.contains('d-none')) {
				toggleElementToShow.classList.remove('d-none');
			} else {
				toggleElementToShow.classList.add('d-none');
			}
		}
	});
}

function removeStringAndSingleQuote(string, removeString = '') {
	return string.replaceAll(removeString, '').replaceAll('\'', '');
}

// Convert Postman CURL to Javascript Objects
function convertCurlToApiRequest() {
	var curlElement = document.getElementById('curlRequest');
	var curlString = "";

	if (!curlElement) {
		alert('Please enter a CURL Request');
		return false;
	}

	curlString = curlElement.value;

	// Clean CURL Request
	curlString = curlString.replaceAll('\n', '').replaceAll('curl --location', '').trim();

	if (curlString.indexOf('--request') !== -1) {
		curlString = curlString.replaceAll('--request', '').trim();
	} else {
		curlString = `POST ${curlString}`;
	}

	// Trim whitespace & split using backslash
	curlString = curlString.trim();
	var curlArray = curlString.split('\\');

	// split the first array index of curlArray string by space to fetch the method and url
	var curlArray2 = curlArray[0].split(' ');

	// get the url
	var url = curlArray2[1].substring(1, curlArray2[1].length - 1);

	// get the method
	var method = curlArray2[0];

	// get the headers, data and more
	var headers = {};
	var data = {};

	for (var i = 1; i < curlArray.length; i++) {
		if (curlArray[i].indexOf('--header') > -1) {
			var headerString = removeStringAndSingleQuote(curlArray[i], '--header ');
			var header = headerString.split(': ');
			headers[header[0]] = header[1].trim();
		} else if (curlArray[i].indexOf('--form') > -1) { // get the form data
			var dataString = removeStringAndSingleQuote(curlArray[i], '--form ');
			var dataArray = dataString.split('=');
			data[dataArray[0]] = dataArray[1].replaceAll('"', '').trim();
		} else if (curlArray[i].indexOf('--data-urlencode') > -1) { // get the data urlencode
			var dataString = removeStringAndSingleQuote(curlArray[i], '--data-urlencode ');
			var dataArray = dataString.split('=');
			data[dataArray[0]] = dataArray[1].replaceAll('"', '').trim();
		} else if (curlArray[i].indexOf('--data') > -1) { // get the data
			var dataString = removeStringAndSingleQuote(curlArray[i], '--data ');
			data = dataString;
		}
	}

	return {url, method, headers, data};
}

// Replace Dynamic Data
function replaceDynamicData(data, obj, type = 'data') {
	if (typeof data === 'string') {
		// Create a regular expression to match dynamic variables
		const regex = /{{([^}]+)}}/g;

		// Use replace with a callback function to dynamically replace variables
		var resultString = data.replace(regex, (match, variable) => {
			// Use regular expression to extract the parts
			var match1 = variable.match(/([a-zA-Z]+)\[(\d+)\]/);
			var match2 = variable.match(/([a-zA-Z]+)\.(.+)/);
			var match3 = variable.match(/([a-zA-Z]+)\[(\d+)\]\.(.+)/);

			// Check if the match was successful
			if (match3) {
				// Extracted values
				var firstPart = match3[1]; // variable name
				var secondPart = match3[2]; // index
				var thirdPart = match3[3];  // object key

				// Display the results
				return obj.hasOwnProperty(firstPart) ? JSON.stringify(obj[firstPart][secondPart][thirdPart]) : null;
			} else if (match2 || match1) {
				var match = match1 || match2;

				// Extracted values
				var firstPart = match[1]; // variable name
				var secondPart = match[2]; // index / object

				// Display the results
				return obj.hasOwnProperty(firstPart) ? JSON.stringify(obj[firstPart])[secondPart] : null;
			} else {
				// Check if the variable exists in the replacements object
				return obj.hasOwnProperty(variable) ? obj[variable] : null;
			}
		});
	
		if (type === 'data') {
			return JSON.parse(resultString);
		}

		return resultString;
	} else {
		for (var key in obj) {
			if (data[key]) {
				data[key] = obj[key];
			}
		}
	}

	return data;
}

// Function to create and toggle the response section
function toggleResponseSection(request, response, statusCode) {
	// Create a new div element
	var responseSection = document.createElement('div');
	responseSection.id = 'responseSection';
	responseSection.classList.add('reponse-section');

	var classes = "text-danger";
	if (statusCode >= 200 && statusCode <= 299) {
		classes = "text-success";
	}

	// Add content to the div
	var contentToAppend = `
		<details class="request-details">
			<summary class="request-summary ${classes}">
				<span class="request-info request-method">${request.method}</span>
				<span class="request-info request-url">${request.url}</span>
				<span class="request-info request-status">${statusCode}</span>
			</summary>
			<p class="response">${response}</p>
		</details>
	`;

	// Check if the response section is already appended to the body
	var existingResponseSection = document.getElementById('responseSection');
	
	if (existingResponseSection) {
		// If it exists, append content to it
		existingResponseSection.innerHTML += contentToAppend;
	} else {
		// If it doesn't exist, append it to the body
		responseSection.innerHTML = contentToAppend;
		document.querySelector('.wrapper').appendChild(responseSection);
	}
}

// Prepend Failed & Success Request Data
function prependFailedAndSuccessRequestData(failedRequestData, successRequestData) {
	var contentToAppend = `
		<details class="request-details">
			<summary class="text-danger">
				Failed Requests: ${failedRequestData.length}
			</summary>
			<p class="response">${JSON.stringify(failedRequestData)}</p>
		</details>
		<details class="request-details">
			<summary class="text-success">
				Success Requests: ${successRequestData.length}
			</summary>
			<p class="response">${JSON.stringify(successRequestData)}</p>
		</details>
	`;

	// Check if the response section is already appended to the body
	var existingResponseSection = document.getElementById('responseSection');
	existingResponseSection.innerHTML = contentToAppend + existingResponseSection.innerHTML;
}

// Parse Response Data
function parseResponseData(data) {
	if (typeof data !== 'string') {
		return JSON.stringify(data, null, 4
			);
	}
	
	return data;
}

// Send request to API using axios
async function sendRequest(request, dataForRequestData = {}) {
	if (typeof request.data === 'string') {
		request.data = JSON.parse(request.data);
	}

	var responseData = "";
	var statusCode = "";
	var requestInfo = JSON.parse(JSON.stringify(request));

	if (!isDefined(requestInfo.data)) {
		requestInfo.data = dataForRequestData;
	}

	const instance = axios.create();

	// Send Request
	return await instance({
		method: request.method,
		url: request.url,
		headers: request.headers,
		data: request.data
	}).then(function (response) {
		// handle success
		responseData = parseResponseData(response.data);
		statusCode = response.status;
		globalSuccessRequestsData.push(requestInfo.data);

		return {
			data: response.data,
			status: statusCode
		};
	}).catch(function (error) {
		// handle error
		responseData = parseResponseData(error);
		statusCode = -1;
		if (error.response) {
			statusCode = error.response.status;
		}
		globalFailedRequestsData.push(requestInfo.data);

		return {
			data: error,
			status: statusCode
		};
	}).then(function (res) {
		toggleResponseSection(requestInfo, responseData, statusCode);
		
		return res;
	});
}

// Function to Loop on Array of Objects
async function sendRequestForObjects(jsonString, request) {
	globalFailedRequestsData = [];
	globalSuccessRequestsData = [];

	// try {
		var existingResponseSection = document.getElementById('responseSection');
		if (existingResponseSection) {
			existingResponseSection.innerHTML = "";
		}

		var jsonData = JSON.parse(jsonString);

		if (jsonData.length > 0) {
			for (let index in jsonData) {
				var newRequestData = JSON.parse(JSON.stringify(request));
				newRequestData.data = replaceDynamicData(newRequestData.data, jsonData[index]);
				newRequestData.url = replaceDynamicData(newRequestData.url, jsonData[index], 'string');

				// Send requests now
				await sendRequest(newRequestData);
			}

			prependFailedAndSuccessRequestData(globalFailedRequestsData, globalSuccessRequestsData);
		}
	// } catch (e) {
	// 	alert('Error: ' + e.message);
	// }
}

/**
 * Value exist for variables
 */
function isDefined(variables) {
	if (variables === null || variables === '' || variables === undefined) {
		return false;
	}

	return true;
}

/**
 * Remove Content from Existing Response Section
 */
function removeContentFromExistingResponseSection() {
	var existingResponseSection = document.getElementById('responseSection');
	if (existingResponseSection) {
		existingResponseSection.innerHTML = "";
	}
}
