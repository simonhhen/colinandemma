const allItems = {};
const purchased = [];
const TEXT = {
    NO_SELECTION: `<span class="lower-emphasis">Please select an item above.</span>`
};
const SERVER_NAME = "https://warm-savannah-04835.herokuapp.com/";

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
            <label>Selected item</label>
            <div id="selected-item" class="selected-item">${TEXT.NO_SELECTION}</div>
            <label>Name</label>
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
        <p><b>Reminder:</b></p><p><b>Contributions can be made by cheque or etransfer to:</b></p>
        <address>Emma Henderson or Colin Graham<br/>
        2134 Rushton Rd<br/>
        Ottawa, ON<br/>
        K2A 1N7
        </address>
        <p>Or</p>
        <p>emma.henderson@rogers.com</p>
        <p>If you have any questions, please reach out to Simon, Kate, or Janine D. or to the bride or groom. We are very happy to help! Thank you for your kind generosity. Looking forward to the big day!</p>
        <a href="http://theknot.com/colinandemma" class="button">Return to Colin and Emma's Wedding Website</a>
    `;
}

const containerNode = document.getElementById('item-container');

let currentRow;

client.get('items').then((items) => {
    containerNode.removeChild();
    for (let c = 0; c < items.length; c++) {
        let element = items[c];
        const itemContainer = document.createElement('div');
        itemContainer.className = 'item-container';
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

        itemContainer.appendChild(item);

        if (c % 3 === 0) {
            currentRow = document.createElement('div');
            currentRow.className = 'row';
            containerNode.appendChild(currentRow);
        }

        allItems[element.id] = element;
        
        currentRow.appendChild(itemContainer);
    }
});

showForm();
const submitButton = document.getElementById('submit-button');
submitButton.addEventListener('click', addContribution);
