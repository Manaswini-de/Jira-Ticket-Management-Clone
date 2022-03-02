let addBtn = document.querySelector(".add");
let body = document.querySelector("body");
let grid = document.querySelector(".grid");
let deleteBtn = document.querySelector(".delete");
let deleteMode = false;

let allFiltersChildren = document.querySelectorAll(".filter div");
let allFilters = document.querySelectorAll(".filter");

for(let i=0; i<allFiltersChildren.length; i++){
    allFiltersChildren[i].addEventListener("click", function(e){
        if(e.currentTarget.parentNode.classList.contains("filterSelected")){
            e.currentTarget.parentNode.classList.remove("filterSelected");
            loadTasks()
        }
        else{
            for(let k=0; k<allFilters.length; k++){
                if(allFilters[k].classList.contains("filterSelected")){
                    allFilters[k].classList.remove("filterSelected");
                }
            }
            e.currentTarget.parentNode.classList.add("filterSelected");
            let filterColor = e.currentTarget.classList[0];
            loadTasks(filterColor);
        }
    })

}

if(localStorage.getItem("AllTickets") == undefined){
    let allTickets = {};

    allTickets = JSON.stringify(allTickets);

    localStorage.setItem("AllTickets", allTickets);
}

loadTasks();

deleteBtn.addEventListener("click", function(e){
    if(e.currentTarget.classList.contains("delete-selected")){
        e.currentTarget.classList.remove("delete-selected"); //to remove the highlight on delete button from UI
        deleteMode = false; // deleteMode = off
    }
    else{
        e.currentTarget.classList.add("delete-selected"); //To add a highlight on delete btn
        deleteMode = true; //deleteMode = on
    }
})

addBtn.addEventListener("click", function(){

    //when add button is clicked, the delete mode should turn off and it should also remove the highlight on it from UI
    deleteBtn.classList.remove("delete-selected"); //removing from UI
    deleteMode = false; //delete mode = off

    // if a modal is already present on the screen, then it can be selected from the document.
    let preModal = document.querySelector(".modal");
    if(preModal!=null) return; // if a modal is already present, then donot re-add it


    let div = document.createElement("div"); //<div></div>
    div.classList.add("modal"); //<div class="modal"></div>

    div.innerHTML = `<div class="task-section">
        <div class="task-inner-container" contenteditable="true"></div>
        </div>
        <div class="priority-section">
        <div class="priority-inner-container">
            <div class="modal-priority pink"></div>
            <div class="modal-priority green"></div>
            <div class="modal-priority blue"></div>
            <div class="modal-priority black selected"></div>
        </div>
        </div>`;
        // the black is having a class "selected" bcz it is the default priority

    body.append(div);

    let ticketColor = "black"; //by default

    let allModalPriority = div.querySelectorAll(".modal-priority");
    // will go inside the div element and get the list of all divs having the class modal-priority -> [pink, green, blue, black]

    for(let i=0; i<allModalPriority.length; i++){

        allModalPriority[i].addEventListener("click", function(e){

            // to remove the previously selected priority
            for(let j=0; j<allModalPriority.length; j++){
                allModalPriority[j].classList.remove("selected");
                // jiske paas selected vali class thi vo hat jayga, aur baakiyo ko koi farak nhi padega
            }

            // to add the priority to the currentTarget(ie. the one which has been clicked)
            e.currentTarget.classList.add("selected");

            //changing the ticketColor as soon as a different color is selected
            ticketColor = e.currentTarget.classList[1];
            // the class list of all the divs having class modal-priority will have 2 classes
            // [0] -> modal-priority
            // [1] -> color (ie. pink,green,blue, black)
        })
    }

    let taskInnerContainer = div.querySelector(".task-inner-container");

    taskInnerContainer.addEventListener("keypress", function(e){

        if(e.key == "Enter"){

            let id = uid();
            let task = e.currentTarget.innerText;

            // step 1: fetch the existing data from the local storage
            let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

            // step 2: update the allTickets object with the current task
            let ticketObj = {
                color: ticketColor,
                taskValue: task
            };
            allTickets[id] = ticketObj;

            // step 3: save the updated object in the local storage
            localStorage.setItem("AllTickets", JSON.stringify(allTickets));


            let ticketDiv = document.createElement("div");
            ticketDiv.classList.add("ticket");

            ticketDiv.setAttribute("data-id", id);

            ticketDiv.innerHTML= `<div data-id="${id}" class="ticket-color ${ticketColor}"></div>
            <div class="ticket-id">#${id}</div>
            <div data-id="${id}" class="actual-task" contenteditable= "true">${task}</div>`

            // implementing the change of colors on clicking on the ticket color div

            let colors = ["pink", "blue", "green", "black"];
            let ticketColorDiv = ticketDiv.querySelector(".ticket-color");
            let actualTaskDiv = ticketDiv.querySelector(".actual-task");

            actualTaskDiv.addEventListener("input", function(e){

                let currTicketId = e.currentTarget.getAttribute("data-id");
                let updatedTask = e.currentTarget.innerText;
                
                // fetch from local storage, update the task and save back to local storage
                let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
                allTickets[currTicketId].taskValue = updatedTask;
                localStorage.setItem("AllTickets", JSON.stringify(allTickets));
            })

            ticketColorDiv.addEventListener("click", function(e){

                let currTicketId = e.currentTarget.getAttribute("data-id");
                let currentColor = e.currentTarget.classList[1];
                let idx = -1;

                for(let i=0; i<colors.length; i++){
                    if(colors[i] == currentColor) idx=i;    
                }

                idx++;
                idx = idx % 4;
                
                let newColor = colors[idx];

                // 1 -> fetch the AllTickets object from localStorage
                let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
                //2 -> update the object
                allTickets[currTicketId].color = newColor;
                //3 -> save the updated object in the localStorage
                localStorage.setItem("AllTickets", JSON.stringify(allTickets)); 

                ticketColorDiv.classList.remove(currentColor);
                ticketColorDiv.classList.add(newColor);

            })

            ticketDiv.addEventListener("click", function(e){
                if(deleteMode == true){

                    let currTicketId = e.currentTarget.getAttribute("data-id");
                    e.currentTarget.remove();

                    //remove from local storage as well
                    let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
                    delete allTickets[currTicketId]
                    localStorage.setItem("AllTickets", JSON.stringify(allTickets));
                }
            })
            
            grid.append(ticketDiv);

            div.remove();
        }
    })

});

function loadTasks(color){

    let ticketsOnUi = document.querySelectorAll(".ticket");

    for( let i=0; i<ticketsOnUi.length; i++){
        ticketsOnUi[i].remove();
    }

    // 1. Fetch all Tickets data
    let allTickets = JSON.parse(localStorage.getItem("AllTickets"));

    // 2. create ticket UI for each ticket object
    // 3. Add required event listeners
    // 4. Add tickets in the grid section of UI

    for(x in allTickets){
        let currTicketId = x;
        let singleTicketObj = allTickets[x];

        if(color){
            //if the color is not undefined, ie. some color is passed
            if(color != singleTicketObj.color){
                continue; // we don't need to load the tickets whose color is not equal to the passed color
            }
        }

        let ticketDiv = document.createElement("div");
        ticketDiv.classList.add("ticket");

        ticketDiv.setAttribute("data-id", currTicketId);

        ticketDiv.innerHTML= `<div data-id="${currTicketId}" class="ticket-color ${singleTicketObj.color}"></div>
        <div class="ticket-id">#${currTicketId}</div>
        <div data-id="${currTicketId}" class="actual-task" contenteditable= "true">${singleTicketObj.taskValue}</div>`

         // implementing the change of colors on clicking on the ticket color div

         let colors = ["pink", "blue", "green", "black"];
         let ticketColorDiv = ticketDiv.querySelector(".ticket-color");
         let actualTaskDiv = ticketDiv.querySelector(".actual-task");

         actualTaskDiv.addEventListener("input", function(e){

            let currTicketId = e.currentTarget.getAttribute("data-id");
            let updatedTask = e.currentTarget.innerText;
            
            // fetch from local storage, update the task and save back to local storage
            let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
            allTickets[currTicketId].taskValue = updatedTask;
            localStorage.setItem("AllTickets", JSON.stringify(allTickets));
        })

        ticketColorDiv.addEventListener("click", function(e){

            let currTicketId = e.currentTarget.getAttribute("data-id");
            let currentColor = e.currentTarget.classList[1];
            let idx = -1;

            for(let i=0; i<colors.length; i++){
                if(colors[i] == currentColor) idx=i;    
            }

            idx++;
            idx = idx % 4;
            
            let newColor = colors[idx];

            // 1 -> fetch the AllTickets object from localStorage
            let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
            //2 -> update the object
            allTickets[currTicketId].color = newColor;
            //3 -> save the updated object in the localStorage
            localStorage.setItem("AllTickets", JSON.stringify(allTickets)); 

            ticketColorDiv.classList.remove(currentColor);
            ticketColorDiv.classList.add(newColor);

        })

        ticketDiv.addEventListener("click", function(e){
            if(deleteMode == true){

                let currTicketId = e.currentTarget.getAttribute("data-id");
                e.currentTarget.remove();

                //remove from local storage as well
                let allTickets = JSON.parse(localStorage.getItem("AllTickets"));
                delete allTickets[currTicketId]
                localStorage.setItem("AllTickets", JSON.stringify(allTickets));
            }
        })
        
        grid.append(ticketDiv);


    }

}