// sample room data
const rooms = [
    { code: "R101", type: "Deluxe Room", price: 3500, maxGuests: 2 },
    { code: "R102", type: "Deluxe Room", price: 3500, maxGuests: 2 },
    { code: "R201", type: "Executive Suite", price: 5800, maxGuests: 3 },
    { code: "R202", type: "Executive Suite", price: 5800, maxGuests: 3 },
    { code: "R301", type: "Family Room", price: 4200, maxGuests: 4 }
];

// a sample of hardcoded bookings "room already booked" validation
const existingBookings = [
    { roomCode: "R101", checkIn: "2026-04-05", checkOut: "2026-04-08" },
    { roomCode: "R201", checkIn: "2026-04-10", checkOut: "2026-04-12" }
];

const checkinInput = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");
const guestFilter = document.getElementById("guestFilter");
const roomTableBody = document.getElementById("roomTableBody");
const sumRoom = document.getElementById("sumRoom");
const sumNights = document.getElementById("sumNights");
const sumTotal = document.getElementById("sumTotal");
const errorBox = document.getElementById("errorBox");

let selectedRoomCode = null;


function renderRooms() {
    roomTableBody.innerHTML = "";
    const minGuests = parseInt(guestFilter.value, 10);

    rooms.forEach(room => {
        // skip rooms that don't fit the guest filter (0 means show all)
        if (minGuests !== 0 && room.maxGuests < minGuests) return;

        const isBooked = isRoomBookedForSelectedDates(room.code);
        const row = document.createElement("tr");
        if (isBooked) row.classList.add("booked");

        row.innerHTML = `
      <td>
        <input type="radio" name="roomChoice" value="${room.code}"
          ${isBooked ? "disabled" : ""}
          ${selectedRoomCode === room.code ? "checked" : ""}>
      </td>
      <td>${room.code}</td>
      <td>${room.type}${isBooked ? " (Booked)" : ""}</td>
      <td>₹${room.price.toLocaleString()}</td>
      <td>${room.maxGuests}</td>
    `;
        roomTableBody.appendChild(row);
    });

    document.querySelectorAll('input[name="roomChoice"]').forEach(radio => {
        radio.addEventListener("change", e => {
            selectedRoomCode = e.target.value;
            calculateBooking();
        });
    });
}

// checks the hardcoded bookings list for a date clash on this room
function isRoomBookedForSelectedDates(roomCode) {
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;
    if (!checkin || !checkout) return false;

    return existingBookings.some(b => {
        if (b.roomCode !== roomCode) return false;

        return checkin < b.checkOut && checkout > b.checkIn;
    });
}

// validates the dates and room, then works out nights and total price
function calculateBooking() {
    clearError();
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;

    sumRoom.textContent = selectedRoomCode || "-";
    sumNights.textContent = "-";
    sumTotal.textContent = "-";

    if (!checkin || !checkout) return; // wait until both dates are picked

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (checkinDate < today) {
        showError("Check-in date cannot be in the past.");
        return;
    }
    if (checkoutDate <= checkinDate) {
        showError("Check-out date must be after the check-in date.");
        return;
    }
    if (!selectedRoomCode) {
        showError("Please select a room to see the price.");
        return;
    }
    if (isRoomBookedForSelectedDates(selectedRoomCode)) {
        showError("This room is already booked for the selected dates. Please choose another room or dates.");
        return;
    }

    const nights = Math.round((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));
    const room = rooms.find(r => r.code === selectedRoomCode);
    const total = nights * room.price;

    sumRoom.textContent = `${room.code} - ${room.type}`;
    sumNights.textContent = nights;
    sumTotal.textContent = `₹${total.toLocaleString()}`;
}

function showError(message) {
    errorBox.textContent = message;
    errorBox.style.display = "block";
}

function clearError() {
    errorBox.style.display = "none";
    errorBox.textContent = "";
}

checkinInput.addEventListener("change", () => { renderRooms(); calculateBooking(); });
checkoutInput.addEventListener("change", () => { renderRooms(); calculateBooking(); });
guestFilter.addEventListener("change", renderRooms);


renderRooms();