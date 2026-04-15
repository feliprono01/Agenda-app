package com.consultorio.backend.controller;

import com.consultorio.backend.scheduler.RecordatorioScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RecordatorioScheduler recordatorioScheduler;

    @PostMapping("/test-recordatorio")
    public ResponseEntity<String> testRecordatorio() {
        recordatorioScheduler.enviarRecordatorios();
        return ResponseEntity.ok("Scheduler disparado manualmente");
    }
}
