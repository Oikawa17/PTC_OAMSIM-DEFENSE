import java.sql.*;
import java.util.*;

public class StudentInfoDAO {

    // Returns a list of all application IDs from the student_info table
    public static List<String> getAllApplicationIds() throws SQLException {
        String query = "SELECT application_id FROM student_info";
        List<String> ids = new ArrayList<>();
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                ids.add(rs.getString("application_id"));
            }
        }
        return ids;
    }

    // Returns a map of column names to values for a given application ID
    public static Map<String, String> getStudentInfo(String applicationId) throws SQLException {
        String query = "SELECT * FROM student_info WHERE application_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, applicationId);
            ResultSet rs = stmt.executeQuery();
            ResultSetMetaData meta = rs.getMetaData();
            if (rs.next()) {
                Map<String, String> info = new HashMap<>();
                for (int i = 1; i <= meta.getColumnCount(); i++) {
                    info.put(meta.getColumnName(i), rs.getString(i));
                }
                return info;
            }
        }
        return null;
    }

    // Generates the "next" application_id and a random 6-letter password
    public static String[] generateNextAppIdAndPassword() throws SQLException {
        java.time.LocalDate now = java.time.LocalDate.now();
        String mm = String.format("%02d", now.getMonthValue());
        String yy = String.valueOf(now.getYear()).substring(2);
        String prefix = mm + yy + "_";

        String getMaxQuery = "SELECT application_id FROM student_info WHERE application_id LIKE ? ORDER BY application_id DESC LIMIT 1";
        int nextNum = 1;
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(getMaxQuery)) {
            stmt.setString(1, prefix + "%");
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                String lastId = rs.getString("application_id");
                String[] parts = lastId.split("-");
                if (parts.length == 2) {
                    nextNum = Integer.parseInt(parts[1]) + 1;
                }
            }
        }
        String appId = prefix + String.format("%04d", nextNum);
        String password = generateRandomPassword(6);
        return new String[] { appId, password };
    }

    public static void insertStudentWithCredentials(String appId, String email, String password) throws SQLException {
        String insertQuery = "INSERT INTO student_info (application_id, email, password) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(insertQuery)) {
            stmt.setString(1, appId);
            stmt.setString(2, email);
            stmt.setString(3, password);
            stmt.executeUpdate();
        }
    }

   public static String generateRandomPassword(int length) {
    String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // Added numbers for better security
    StringBuilder sb = new StringBuilder();
    java.util.Random rand = new java.util.Random();
    
    for (int i = 0; i < length; i++) { 
        sb.append(chars.charAt(rand.nextInt(chars.length()))); 
    }
    
    return sb.toString();
}


    // Deletes a student record by application ID
    public static void deleteStudent(String applicationId) throws SQLException {
        String query = "DELETE FROM student_info WHERE application_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, applicationId);
            stmt.executeUpdate();
        }
    }
}