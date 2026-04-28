package com.crm.realEstae.otp;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    private static class OtpData {
        String otp;
        LocalDateTime expiryTime;

        OtpData(String otp, LocalDateTime expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    private final Map<String, OtpData> otpMap = new ConcurrentHashMap<>();

    // 🔹 Save OTP with expiry (10 minutes)
    public void saveOtp(String email, String otp) {
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);
        otpMap.put(email, new OtpData(otp, expiry));
    }

    // 🔹 Verify OTP with expiry check
    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpMap.get(email);

        if (data == null) {
            throw new RuntimeException("OTP not found. Please request a new one.");
        }

        // ❌ Expired
        if (LocalDateTime.now().isAfter(data.expiryTime)) {
            otpMap.remove(email);
            throw new RuntimeException("OTP expired");
        }

        // ❌ Wrong OTP
        if (!data.otp.equals(otp)) {
            return false;
        }

        // ✅ Valid OTP
        otpMap.remove(email);
        return true;
    }
}
