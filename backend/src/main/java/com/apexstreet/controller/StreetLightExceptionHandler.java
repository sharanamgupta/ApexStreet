package com.apexstreet.controller;

import com.apexstreet.service.DuplicateStreetLightException;
import com.apexstreet.service.StreetLightNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice(assignableTypes = StreetLightController.class)
public class StreetLightExceptionHandler {
    @ExceptionHandler(StreetLightNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(StreetLightNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(DuplicateStreetLightException.class)
    public ResponseEntity<Map<String, String>> duplicate(DuplicateStreetLightException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> validation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream().findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("Invalid street light request.");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    @ExceptionHandler({IllegalArgumentException.class, DataIntegrityViolationException.class})
    public ResponseEntity<Map<String, String>> badRequest(Exception ex) {
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid street light request."));
    }
}
