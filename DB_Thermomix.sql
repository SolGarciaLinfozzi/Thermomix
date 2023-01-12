create database thermomix;
use thermomix;

create table usuarios(
email varchar(200) not null,
nombre varchar(200) not null,
contrasenia varchar(20) not null,
primary key(email)
); 

create table comentarios(
idComentario int unsigned  not null auto_increment,
email varchar(200) not null,
nombre varchar(200) not null,
comentario varchar(400) not null,
primary key(idComentario)
); 

create table consultas(
idConsulta int unsigned  not null auto_increment,
nombre varchar(200) not null,
email varchar(200) not null,
consulta varchar(400) not null,
primary key(idConsulta)
); 




