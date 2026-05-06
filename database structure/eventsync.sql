create database eventsync;
use eventsync;

create table events(
    event_id int auto_increment primary key,
    title varchar(100) not null,
    description varchar(100) not null,
    event_date datetime not null,
    venue varchar(100) not null,
    ticket_price decimal(10,2) not null,
    max_capacity int,
    created_at timestamp default current_timestamp
);


create table tickets(
    ticket_id int auto_increment primary key,
    event_id int not null,
    buyer_name varchar(100) not null,
    buyer_email varchar(150) not null,
    buyer_phone varchar(20),
    payhere_payment_id varchar(100) unique not null,
    qr_secure_hash varchar(255) unique not null,
    purchased_at timestamp default current_timestamp,
    scanned_at timestamp null,
    order_id VARCHAR(100) UNIQUE,
    foreign key (event_id) references events(event_id) on delete cascade on update cascade
);