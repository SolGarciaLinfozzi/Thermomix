create database thermomix;
use thermomix;

create table usuarios(
email varchar(100) not null,
nombre varchar(50) not null,
contrasenia varchar(150) not null,
primary key(email)
); 

create table comentarios(
idComentario int unsigned  not null auto_increment,
email varchar(100),
nombre varchar(100),
comentario varchar(15000),
primary key(idComentario)
); 

create table consultas(
idConsulta int unsigned  not null auto_increment,
nombre varchar(100),
email varchar(100),
consulta varchar(15000),
primary key(idConsulta)
); 


-- Eliminar una tabla de datos --
drop table comentarios;
drop table usuarios;
drop table consultas;




