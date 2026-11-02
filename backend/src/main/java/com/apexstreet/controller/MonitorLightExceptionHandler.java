package com.apexstreet.controller;

import com.apexstreet.service.MonitorLightNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice(assignableTypes = MonitorLightController.class)
public class MonitorLightExceptionHandler {
    @ExceptionHandler(MonitorLightNotFoundException.class) public ResponseEntity<Map<String,String>> notFound(Exception ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage())); }
    @ExceptionHandler(IllegalArgumentException.class) public ResponseEntity<Map<String,String>> badRequest(Exception ex) { return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage())); }
    @ExceptionHandler(IllegalStateException.class) public ResponseEntity<Map<String,String>> conflict(Exception ex) { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage())); }
    @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<Map<String,String>> validation(MethodArgumentNotValidException ex) { return ResponseEntity.badRequest().body(Map.of("error", "Invalid monitor lights request.")); }
    @ExceptionHandler(DataIntegrityViolationException.class) public ResponseEntity<Map<String,String>> integrity() { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Monitor data conflicts with an existing record.")); }
}
