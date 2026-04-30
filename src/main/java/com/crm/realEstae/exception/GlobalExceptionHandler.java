package com.crm.realEstae.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        Map<String, String> response = new HashMap<>();
        String message = ex.getMessage();
        
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        
        if (message != null) {
            if (message.contains("Invalid credentials")) {
                status = HttpStatus.UNAUTHORIZED; // 401
            } else if (message.contains("pending approval") || message.contains("not approved")) {
                status = HttpStatus.FORBIDDEN; // 403
            } else if (message.contains("already registered") || message.contains("already exists")) {
                status = HttpStatus.CONFLICT; // 409
            } else if (message.contains("not found")) {
                status = HttpStatus.NOT_FOUND; // 404
            }
        }
        
        response.put("message", message);
        return new ResponseEntity<>(response, status);
    }
}
