package com.consultorio.backend.repository;

import com.consultorio.backend.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {

    List<Turno> findByFechaHoraBetweenOrderByFechaHoraAsc(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT t FROM Turno t WHERE DATE(t.fechaHora) = :fecha AND t.recordatorioEnviado = false AND t.estado != 'CANCELADO'")
    List<Turno> findTurnosPendientesDeRecordatorio(@Param("fecha") LocalDate javaDateFromTimeOffset);

    @Modifying
    @Transactional
    @Query("DELETE FROM Turno t WHERE t.paciente.id = :pacienteId")
    void deleteByPacienteId(@Param("pacienteId") Long pacienteId);
}

