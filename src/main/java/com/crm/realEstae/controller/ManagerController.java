package com.crm.realEstae.controller;

import com.crm.realEstae.entity.User;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ManagerController {

    private final UserRepository userRepository;

    @GetMapping("/agents")
    @PreAuthorize("hasRole('MANAGER')")
    public List<User> getMyAgents(Principal principal) {
        User manager = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        return userRepository.findByAssignedManager(manager);
    }
}
