package com.consultorio.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "turnos")
@Data
@NoArgsConstructor
public class Turno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    private Integer duracionMinutos = 30;
    
    @Column(length = 500)
    private String motivo;

    @Enumerated(EnumType.STRING)
    private EstadoTurno estado = EstadoTurno.PENDIENTE;

    private Boolean recordatorioEnviado = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
