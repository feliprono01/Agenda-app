package com.consultorio.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pacientes")
@Data
@NoArgsConstructor
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String apellido;

    @Column(nullable = false, length = 20)
    private String telefono; // con código de país, ej: 5493415551234

    private String email;

    @Column(length = 20)
    private String dni;

    private LocalDate fechaNacimiento;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    private LocalDateTime createdAt = LocalDateTime.now();
}
