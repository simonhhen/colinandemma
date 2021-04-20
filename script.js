const items = [
    {
        name: 'item 1',
        id: 'item-0',
        imgSource: 'imageSource',
        price: 250,
        raised: 0,
    },
    {
        name: 'item 2',
        id: 'item-1',
        imgSource: 'imageSource',
        price: 120,
        raised: 50,
    },
    {
        name: 'item 3',
        id: 'item-2',
        imgSource: 'imageSource',
        price: 400,
        raised: 400,
    },
    {
        name: 'item 4',
        id: 'item-3',
        imgSource: 'imageSource',
        price: 100,
        raised: 50,
    },
    {
        name: 'item 5',
        id: 'item-4',
        imgSource: 'imageSource',
        price: 100,
        raised: 50,
    },
]

function clickHandler(event) {
    if (this.selected === event.currentTarget.id) {
        return;
    }
    if (this.selected) {
        document.getElementById(this.selected).classList.toggle('item-selected');
    }
    event.currentTarget.classList.toggle('item--selected');
    this.selected = event.currentTarget.id;
}

const containerNode = document.getElementById('item-container');

let currentRow;

for (let c = 0; c < items.length; c++) {
    let element = items[c];
    const itemContainer = document.createElement('div');
    itemContainer.className = 'item-container';
    const item = document.createElement('div');
    item.className = 'item';
    item.id = `item-${c}`;
    item.addEventListener('click', clickHandler);

    const title = document.createElement('h3');
    title.className = 'item-title';
    title.innerText = element.name;
    
    const fundsRaised = document.createElement('span');
    if (element.raised === element.price) {
        fundsRaised.innerText = 'Purchased!';
        item.className += ' item--purchased'
    } else {
        fundsRaised.innerText = `${element.raised}/${element.price}`;
    }

    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.width = `${element.raised/element.price*100}%`;

    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress-bar-container';
    progressBarContainer.appendChild(progressBar);
    
    item.appendChild(title);
    item.appendChild(fundsRaised);
    item.appendChild(progressBarContainer);

    itemContainer.appendChild(item);

    if (c % 3 === 0) {
        currentRow = document.createElement('div');
        currentRow.className = 'row';
        containerNode.appendChild(currentRow);
    }

    currentRow.appendChild(itemContainer);
}