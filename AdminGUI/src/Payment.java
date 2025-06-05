import java.awt.*;
import java.sql.*;
import javax.swing.*;

public class Payment {
    /**
     * Shows the payment verification frame for the given application ID.
     * Displays the reference number and payment method from the payments table and provides Verified/Rejected buttons.
     */
    public static void verifyPayment(String applicationId) {
        JFrame paymentFrame = new JFrame("Payment Verification");
        paymentFrame.setSize(500, 300);
        paymentFrame.setLocationRelativeTo(null);
        paymentFrame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);

        JPanel mainPanel = new JPanel(new BorderLayout(10, 20));
        mainPanel.setBorder(BorderFactory.createEmptyBorder(30, 30, 30, 30));

        // Fetch payment info
        PaymentInfo paymentInfo = getPaymentInfo(applicationId);

        // Reference Number
        JLabel refLabel = new JLabel("Reference Number:");
        refLabel.setFont(new Font("Arial", Font.BOLD, 16));
        JTextField refField = new JTextField(paymentInfo.referenceNumber);
        refField.setEditable(false);
        refField.setFont(new Font("Arial", Font.PLAIN, 16));
        refField.setBorder(null);
        refField.setBackground(mainPanel.getBackground());

        // Payment Method
        JLabel methodLabel = new JLabel("Payment Method:");
        methodLabel.setFont(new Font("Arial", Font.BOLD, 16));
        JTextField methodField = new JTextField(paymentInfo.method);
        methodField.setEditable(false);
        methodField.setFont(new Font("Arial", Font.PLAIN, 16));
        methodField.setBorder(null);
        methodField.setBackground(mainPanel.getBackground());

        JPanel infoPanel = new JPanel();
        infoPanel.setLayout(new GridLayout(2, 2, 10, 20));
        infoPanel.add(refLabel);
        infoPanel.add(refField);
        infoPanel.add(methodLabel);
        infoPanel.add(methodField);

        // Buttons
        JPanel btnPanel = new JPanel(new GridLayout(1, 2, 30, 0));
        JButton verifiedBtn = new JButton("Verified");
        JButton rejectedBtn = new JButton("Rejected");

        verifiedBtn.addActionListener(e -> {
            boolean updated = updatePaymentStatus(applicationId, "Verified");
            if (updated) {
                JOptionPane.showMessageDialog(paymentFrame, "Payment has been VERIFIED.");
                paymentFrame.dispose();
            } else {
                JOptionPane.showMessageDialog(paymentFrame, "Failed to update payment status.");
            }
        });

        rejectedBtn.addActionListener(e -> {
            boolean updated = updatePaymentStatus(applicationId, "Rejected");
            if (updated) {
                JOptionPane.showMessageDialog(paymentFrame, "Payment marked as REJECTED.");
                paymentFrame.dispose();
            } else {
                JOptionPane.showMessageDialog(paymentFrame, "Failed to update payment status.");
            }
        });

        btnPanel.add(verifiedBtn);
        btnPanel.add(rejectedBtn);

        mainPanel.add(infoPanel, BorderLayout.CENTER);
        mainPanel.add(btnPanel, BorderLayout.SOUTH);

        paymentFrame.add(mainPanel);
        paymentFrame.setVisible(true);
    }
    // Get reference number and method from payments table
    private static PaymentInfo getPaymentInfo(String applicationId) {
        String referenceNumber = "";
        String method = "";
        String sql = "SELECT reference_number, method FROM payments WHERE application_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, applicationId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                referenceNumber = rs.getString("reference_number");
                method = rs.getString("method");
            }
        } catch (SQLException ex) {
            referenceNumber = "Error: " + ex.getMessage();
            method = "Error";
        }
        return new PaymentInfo(referenceNumber != null ? referenceNumber : "", method != null ? method : "");
    }

    // Update payment status in payments table
    private static boolean updatePaymentStatus(String applicationId, String status) {
        String sql = "UPDATE payments SET status = ? WHERE application_id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setString(2, applicationId);
            int affected = stmt.executeUpdate();
            return affected > 0;
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null, "Database error: " + ex.getMessage());
            return false;
        }
    }
    // Helper class to hold payment info
    private static class PaymentInfo {
        String referenceNumber;
        String method;
        PaymentInfo(String referenceNumber, String method) {
            this.referenceNumber = referenceNumber;
            this.method = method;
        }
    }
}