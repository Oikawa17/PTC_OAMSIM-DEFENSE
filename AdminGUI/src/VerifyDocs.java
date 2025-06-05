import java.awt.*;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import javax.swing.*;

public class VerifyDocs {
    /**
     * Shows a frame with seven document buttons and a back button at the top left.
     * Each document button opens a view frame as described.
     * @param parent The parent frame (for positioning).
     * @param applicationId The application ID (used to locate the row in the database).
     */
    public static void showVerifyDocumentsFrame(JFrame parent, String applicationId) {
        JFrame docFrame = new JFrame("Verify Documents");
        docFrame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
        docFrame.setSize(500, 350);
        docFrame.setLocationRelativeTo(parent);

        // Document names and their corresponding DB column names
        String[][] docNames = {
            {"Form 137", "form_137"},
            {"Form 138", "form_138"},
            {"Birth Certificate", "birth_certificate"},
            {"Good Moral", "good_moral"},
            {"Medical Certificate", "med_certificate"},
            {"ID Photo", "id_photos"},
            {"Recommendation Letter", "recommendation_letter"}
        };

        JPanel mainPanel = new JPanel(new BorderLayout());

        // Top panel with back button
        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.LEFT));
        JButton backBtn = new JButton("Back");
        backBtn.addActionListener(e -> docFrame.dispose());
        topPanel.add(backBtn);
        mainPanel.add(topPanel, BorderLayout.NORTH);

        // Center panel with document buttons
        JPanel centerPanel = new JPanel(new GridLayout(4, 2, 15, 15));
        centerPanel.setBorder(BorderFactory.createEmptyBorder(20, 40, 20, 40));
        for (String[] doc : docNames) {
            String docLabel = doc[0];
            String dbColumn = doc[1];
            JButton btn = new JButton(docLabel);
            btn.setFont(new Font("Arial", Font.PLAIN, 16));
            btn.addActionListener(e -> {
                JFrame viewFrame = new JFrame(docLabel + " Verification");
                viewFrame.setSize(400, 250);
                viewFrame.setLocationRelativeTo(docFrame);
                viewFrame.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);

                JPanel mainViewPanel = new JPanel(new GridLayout(1, 2));

                // Left panel with doc name
                JPanel leftPanel = new JPanel(new GridBagLayout());
                JLabel label = new JLabel(docLabel);
                label.setFont(new Font("Arial", Font.BOLD, 20));
                leftPanel.add(label);

                // Right panel with back, verified, rejected
                JPanel rightPanel = new JPanel();
                rightPanel.setLayout(null);

                JButton rightBackBtn = new JButton("Back");
                rightBackBtn.setBounds(10, 10, 80, 30);
                rightBackBtn.addActionListener(ev -> viewFrame.dispose());

                JButton verifiedBtn = new JButton("Verified");
                verifiedBtn.setBounds(50, 60, 100, 50);
                verifiedBtn.addActionListener(ev -> {
                    updateDocStatus(applicationId, dbColumn, "verified");
                    JOptionPane.showMessageDialog(viewFrame, docLabel + " marked as VERIFIED.");
                    viewFrame.dispose();
                });

                JButton rejectedBtn = new JButton("Rejected");
                rejectedBtn.setBounds(50, 120, 100, 50);
                rejectedBtn.addActionListener(ev -> {
                    updateDocStatus(applicationId, dbColumn, "rejected");
                    JOptionPane.showMessageDialog(viewFrame, docLabel + " marked as REJECTED.");
                    viewFrame.dispose();
                });

                rightPanel.add(rightBackBtn);
                rightPanel.add(verifiedBtn);
                rightPanel.add(rejectedBtn);

                mainViewPanel.add(leftPanel);
                mainViewPanel.add(rightPanel);

                viewFrame.add(mainViewPanel);
                viewFrame.setVisible(true);
            });
            centerPanel.add(btn);
        }
        mainPanel.add(centerPanel, BorderLayout.CENTER);

        docFrame.add(mainPanel);
        docFrame.setVisible(true);
    }

    // Helper method to update the document status in the database
    private static void updateDocStatus(String applicationId, String columnName, String status) {
        // MySQL JDBC connection for XAMPP
        String url = "jdbc:mysql://localhost:3306/main";
        String user = "root";
        String password = ""; // XAMPP default is empty password

        String sql = "UPDATE doc_uploaded SET " + columnName + " = ? WHERE application_id = ?";
        try (Connection conn = DriverManager.getConnection(url, user, password);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, status);
            pstmt.setString(2, applicationId);
            pstmt.executeUpdate();
        } catch (SQLException ex) {
            JOptionPane.showMessageDialog(null, "Database error: " + ex.getMessage());
        }
    }
}