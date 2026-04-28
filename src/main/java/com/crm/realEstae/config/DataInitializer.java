package com.crm.realEstae.config;

import com.crm.realEstae.entity.Address;
import com.crm.realEstae.entity.User;
import com.crm.realEstae.entity.enums.Role;
import com.crm.realEstae.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String email;

    @Value("${app.admin.password}")
    private String password;

    @Value("${app.admin.name}")
    private String name;

    @Value("${app.admin.phone}")
    private String phone;

    @Value("${app.admin.street}")
    private String street;

    @Value("${app.admin.city}")
    private String city;

    @Value("${app.admin.state}")
    private String state;

    @Value("${app.admin.pincode}")
    private String pincode;

    @Override
    public void run(String... args) {
        seedAdmin();
    }

    private void seedAdmin() {

        if (userRepository.existsByEmail(email)) {
            User existingAdmin = userRepository.findByEmail(email).orElse(null);
            if (existingAdmin != null) {
                boolean updated = false;
                if (!existingAdmin.isApproved()) {
                    existingAdmin.setApproved(true);
                    updated = true;
                }
                // Sync password if it doesn't match the encoded property
                if (!passwordEncoder.matches(password, existingAdmin.getPassword())) {
                    existingAdmin.setPassword(passwordEncoder.encode(password));
                    updated = true;
                }
                if (updated) {
                    userRepository.save(existingAdmin);
                    System.out.println("Existing admin updated (approved/password synced)");
                } else {
                    System.out.println("Admin already exists and is up to date");
                }
            }
            return;
        }

        User admin = new User();
        admin.setName(name);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setPhone(phone);
        admin.setRole(Role.ADMIN);
        admin.setApproved(true);

        Address address = new Address();
        address.setStreet(street);
        address.setCity(city);
        address.setState(state);
        address.setPincode(pincode);

        admin.setAddress(address);

        userRepository.save(admin);

        System.out.println("Admin created from properties");
    }
}

