package com.apexstreet.controller;

import com.apexstreet.service.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestControllerAdvice(assignableTypes = AreaController.class)
public class AreaExceptionHandler {
    @ExceptionHandler(AreaNotFoundException.class) public ResponseEntity<Map<String,String>> notFound(Exception ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage())); }
    @ExceptionHandler(DuplicateAreaException.class) public ResponseEntity<Map<String,String>> duplicate(Exception ex) { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage())); }
    @ExceptionHandler(IllegalStateException.class) public ResponseEntity<Map<String,String>> conflict(Exception ex) { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage())); }
    @ExceptionHandler(MethodArgumentNotValidException.class) public ResponseEntity<Map<String,String>> validation() { return ResponseEntity.badRequest().body(Map.of("error", "Area name, type, and valid values are required.")); }
    @ExceptionHandler({IllegalArgumentException.class, DataIntegrityViolationException.class}) public ResponseEntity<Map<String,String>> badRequest(Exception ex) { return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage() == null ? "Invalid area request." : ex.getMessage())); }
}
