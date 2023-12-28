const allItems = {};
const purchased = [];
const TEXT = {
    NO_SELECTION: `<span class="lower-emphasis">Please select an item above.</span>`
};
const SERVER_NAME = "https://simonandryan-api.onrender.com/";

var HttpClient = function() {
    this.get = function(url) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() { 
                if (request.readyState == 4 && request.status == 200) {
                    resolve(JSON.parse(request.response));
                }
            }

            request.open("GET", `${SERVER_NAME}${url}`, true);            
            request.send(null);
        });
    }
    this.post = function(url, data) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("POST", `${SERVER_NAME}${url}`);      
            request.setRequestHeader('Content-Type', 'application/json');  
            request.send(JSON.stringify(data));

            request.onload = () => {
                console.log(request.responseText);
                resolve(JSON.parse(request.response));
            }
        })
    }
    this.put = function(url, data) {
        return new Promise(function(resolve, reject) {
            var request = new XMLHttpRequest();
            request.open("PUT", `${SERVER_NAME}${url}`);      
            request.setRequestHeader('Content-Type', 'application/json');  
            request.send(JSON.stringify(data));

            request.onload = () => {
                console.log(request.responseText);
                resolve(JSON.parse(request.response));
            }
        })
    }
}

function formatTally(item) {
    return `${item.raised}/${item.price}`;
}

var client = new HttpClient();
let selected;
let selectedItemStatus;
let active = true;

function removedSelectedItem() {
    document.getElementById(selected)?.classList.remove('item--selected');
    selectedItemStatus.innerHTML = TEXT.NO_SELECTION; 
    selected = null;
}

function addSelectedItem(item) {
    item.classList.toggle('item--selected');

    selectedItemStatus.innerText = `You have selected to contribute to: ${allItems[item.id].name}`;
    selected = item.id;
}

function clickHandler(event) {
    if (!active) return;
    if (selected === event.currentTarget.id || purchased.includes(event.currentTarget.id)) {
        removedSelectedItem();
        return;
    }
    if (selected) {
        removedSelectedItem();
    }
    addSelectedItem(event.currentTarget);
}

function addContribution() {
    if (!selected) return;
    const id = selected;
    const name = document.getElementById('contribution-name').value;
    const amount = parseInt(document.getElementById('contribution-amount').value);
    
    client.post('contributions', {
        id,
        name,
        amount
    }).then((response) => {
        const item = allItems[response.id];
        item.raised += response.amount;
        const data = {
            raised: item.raised,
        };
        client.put(`items/${item._id}`, data).then((response) => {
            const progressBar = document.getElementById(`progress-bar-${response.id}`);
            progressBar.style.width = `${response.raised/response.price*100}%`;

            const fundsRaised = document.getElementById(`funds-raised-${response.id}`)
            if (response.raised >= response.price) {
                purchased.push(response.id);
                fundsRaised.innerText = 'Purchased!';
                selected = null;
                document.getElementById(response.id).classList.toggle('item--selected');
                document.getElementById(response.id).classList.add('item--purchased');
            } else {
                fundsRaised.innerText = formatTally(response);
            }
            active = false;
            removedSelectedItem();
            showThankYou(response.name, amount);
        })
    });
}

function showForm() {
    document.getElementById('form-container').innerHTML = `
        <form>
            <label class="selected-label">Selected item</label>
            <div id="selected-item" class="selected-item">${TEXT.NO_SELECTION}</div>
            <label>Your name</label>
            <input type="text" placeholder="Name" id="contribution-name">
            <label>Contribution amount</label>
            <input type="number" placeholder="0" id="contribution-amount">
            <button class="button" type="button" id="submit-button">Submit</button>
        </form>
    `;
    selectedItemStatus = document.getElementById('selected-item');
}
function showThankYou(name, amount) {
    window.scrollTo(0, 0);
    document.getElementById('form-container').innerHTML= "";
    document.getElementById('instructions').innerHTML = `
        <h3>Thank you for contributing $${amount} toward “${name}”!</h3>
            <ul class="one-or-other">
            <li><address>Ryan Heney or Simon Henderson<br/>
                118 ST PETER STREET<br/>
                WHITBY ON  L1N 1J1
                </address></li>
            <span class="or">or</span>
            <li>simon_henderson@rogers.com</li>
            </ul>
          <p>*<i>Please note all fields in this form are only visible to Ryan and Simon</i></p>
          <p>If you have any questions relating to this form, please reach out to Janine or either of the grooms. We are happy to help! Thank you for your generosity.</p>
        <a href="https://www.theknot.com/ryanandsimon" class="button">Return to Ryan & Simon&rsquo;s wedding website</a>
    `;
}

const containerNode = document.getElementById('item-container');

let currentRow;

client.get('items').then((items) => {
    containerNode.innerHTML = "";
    for (let c = 0; c < items.length; c++) {
        let element = items[c];
        const item = document.createElement('div');
        item.className = 'item';
        item.id = element.id;
        item.addEventListener('click', clickHandler);

        const title = document.createElement('h3');
        title.className = 'item-title';
        title.innerText = element.name;
        
        const raisedDetails = document.createElement('div');
        raisedDetails.className = 'raised-details';

        const fundsRaised = document.createElement('span');
        fundsRaised.className = 'funds-raised';
        fundsRaised.id = `funds-raised-${element.id}`;
        if (element.raised >= element.price) {
            purchased.push(element.id);
            fundsRaised.innerText = 'Purchased!';
            item.className += ' item--purchased'
        } else {
            fundsRaised.innerText = formatTally(element);
        }

        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        const image = document.createElement('img');
        image.className = 'item-image';
        image.src = `images/${element.imgSource}`;
        const tagMark = document.createElement('i');
        tagMark.className = "fas fa-tag icon purchased-icon";
        imageContainer.appendChild(tagMark);
        imageContainer.appendChild(image);

        const progressBar = document.createElement('div');
        progressBar.id = `progress-bar-${element.id}`;
        progressBar.className = 'progress-bar';

        const percentRaised = element.raised/element.price;
        progressBar.style.width = `${(percentRaised >= 1 ? 1 : percentRaised)*100}%`;

        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progress-bar-container';
        progressBarContainer.appendChild(progressBar);
        
        const checkMark = document.createElement('i');
        checkMark.className = "far fa-check-circle icon selected-icon";
        item.appendChild(checkMark);
        item.appendChild(title);
        item.appendChild(imageContainer);
        raisedDetails.appendChild(fundsRaised);
        raisedDetails.appendChild(progressBarContainer);
        item.appendChild(raisedDetails)

        allItems[element.id] = element;
        
        containerNode.appendChild(item);
    }
});

showForm();
const submitButton = document.getElementById('submit-button');
submitButton.addEventListener('click', addContribution);
