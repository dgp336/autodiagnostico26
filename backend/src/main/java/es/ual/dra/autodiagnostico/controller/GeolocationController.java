package es.ual.dra.autodiagnostico.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/api/geolocation")
public class GeolocationController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping
    public ResponseEntity<?> getGeolocation() {
        try {
            // Fetch client's public IP geolocation from ipapi.co directly server-to-server
            Map<?, ?> response = restTemplate.getForObject("https://ipwho.is/", Map.class);
            System.out.println("response ipapi.co: " + response);
            if (response != null && response.containsKey("latitude") && response.containsKey("longitude")) {
                return ResponseEntity.ok(Map.of(
                        "lat", response.get("latitude"),
                        "lng", response.get("longitude")));
            }
            return ResponseEntity.badRequest().body("Failed to parse geolocation");
        } catch (Exception e) {
            // Safe fallback to Madrid coordinates if the external service is down or times
            // out
            return ResponseEntity.ok(Map.of("lat", 40.416775, "lng", -3.703790));
        }
    }
}
