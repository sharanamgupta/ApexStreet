package com.apexstreet.controller;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestControllerAdvice public class AutomationExceptionHandler {
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<Map<String,String>> bad(IllegalArgumentException e){return ResponseEntity.badRequest().body(Map.of("error",e.getMessage()));}
}
