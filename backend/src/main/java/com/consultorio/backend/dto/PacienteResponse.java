package com.consultorio.backend.dto;

import java.time.LocalDate;

public record PacienteResponse(Long id, String nombre, String apellido, String telefono, String email, String dni, LocalDate fechaNacimiento, String observaciones) {}
