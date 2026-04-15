package com.consultorio.backend.dto;

import java.time.LocalDate;

public record PacienteRequest(String nombre, String apellido, String telefono, String email, String dni, LocalDate fechaNacimiento, String observaciones) {}
