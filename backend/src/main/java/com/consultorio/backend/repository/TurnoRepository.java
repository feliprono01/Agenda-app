package com.consultorio.backend.repository;

import com.consultorio.backend.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    List<Turno> findByFechaHoraBetweenOrderByFechaHoraAsc(LocalDateTime inicio, LocalDateTime fin);

    // Para el cron job: turnos del día siguiente que no tienen recordatorio enviado
    @Query("SELECT t FROM Turno t WHERE DATE(t.fechaHora) = :fecha AND t.recordatorioEnviado = false AND t.estado != 'CANCELADO'")
    List<Turno> findTurnosPendientesDeRecordatorio(@Param("fecha") LocalDate javaDateFromTimeOffset);
}
