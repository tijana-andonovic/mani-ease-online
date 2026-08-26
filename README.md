# Nail Polish Pro

Create a web application for booking manicure appointments. The frontend of the application should be built in React. The app should be simple to use, clear, modern, and responsive, so it looks good both on a computer and on a mobile phone. 

App goal: Users can view available manicure services, choose a date and a free time slot, and then book an appointment. The administrator can manage services and booked appointments as well as publish available time slots.

User roles:

1. User

The user should be able to:

- Register

- Log in

- View available services

- Select a service

- Optionally add a comment

- Choose a date

- See only available time slots

- Book an appointment

- View their booked appointments

- Cancel an appointment

- View the history of their appointments


2. Administrator

 The administrator should be able to:

 - log in to the admin panel

 - add services

 - edit services

 - delete services

 - view all scheduled appointments

 - confirm or cancel appointments

 - mark appointments as completed

 - view users

Services:

Each service should have:

- name

- description

- price

- duration

- image

Examples of services:

- Classic manicure

- Gel polish

- Nail extensions

- Nail enhancements

- French manicure

- Nail art

- Gel polish removal


Booking an appointment:

A booking should include:

- user

- service

- date

- time

- price

- duration of the service

- booking status

Booking statuses:

- pending

- confirmed

- cancelled

- completed

Booking rules:

- The user cannot book an already taken time slot

- Only free time slots should be shown to the user

- It is not possible to book a time in the past

- After successful booking, the time slot should be marked as taken

- The user should get a message that the appointment was successfully booked

- The user can cancel their own appointment

- The administrator can change the status of a booking


App pages:

Public section:

-Home page

-Services

-About us

-Contact

-Login

-Register

User section:

-My profile

-Schedule an appointment

-My appointments

-Appointment history

Admin section:

-Admin Dashboard

-Manage services

-Manage appointments

-Manage users

Scheduling:

The scheduling process should look like this:

1. User selects a service

2. User selects a date

3. The app shows available slots

4. User selects a slot

5. A reservation overview is displayed:

   -service

   -date

   -time

   -price

   -duration

6. User confirms the reservation

7. The app saves the reservation and shows a successful booking message


React:

Use React components so that the application is modular and easy to maintain.

Use:

- React Router for navigation

- Context API or appropriate state management for application state

- Forms with validation

- Loading and error states

- Protected routes for user and admin sections

DESIGN:

The design should be elegant and modern, with a theme related to a beauty/manicure salon.

Use:

- Soft and modern colors

- Clear cards for services

- Cards for staff

- Date picker for choosing dates

- Clear buttons for selecting appointments

- Clear success and error messages

- Responsive design for mobile phones, tablets, and desktops

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mani-ease-online.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9b636bb7-5809-4aba-92cf-e1ce875d41fd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
