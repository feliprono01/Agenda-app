package com.consultorio.backend.controller;

import com.consultorio.backend.dto.TurnoRequest;
import com.consultorio.backend.dto.TurnoResponse;
import com.consultorio.backend.service.TurnoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
public class TurnoController {

    private final TurnoService turnoService;

    @GetMapping
    public ResponseEntity<List<TurnoResponse>> getTurnos(
            @RequestParam String desde,
            @RequestParam String hasta) {
        return ResponseEntity.ok(turnoService.getTurnosPorRango(desde, hasta));
    }

    @PostMapping
    public ResponseEntity<TurnoResponse> crearTurno(@RequestBody TurnoRequest request) {
        return ResponseEntity.ok(turnoService.crearTurno(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TurnoResponse> actualizarTurno(@PathVariable Long id,
                                                         @RequestBody TurnoRequest request) {
        return ResponseEntity.ok(turnoService.actualizarTurno(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelarTurno(@PathVariable Long id) {
        turnoService.cancelarTurno(id);
        return ResponseEntity.noContent().build();
    }
}
