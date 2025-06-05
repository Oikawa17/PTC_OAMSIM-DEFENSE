import java.awt.*;
import java.awt.datatransfer.*;
import java.awt.event.*;
import javax.swing.*;

public class AddStudent extends JDialog {
    private JTextField emailField;
    private JLabel appIdLabel;
    private JLabel passwordLabel;
    private JLabel statusLabel;
    private JButton addButton;
    private JButton copyButton;
    private JButton sendEmailButton;

    private String generatedAppId;
    private String generatedPassword;

    public AddStudent(JFrame parent) {
        super(parent, "Add Student", true);
        setSize(600, 220); // Wider window
        setLocationRelativeTo(parent);

        emailField = new JTextField(20);
        appIdLabel = new JLabel("Application ID: ");
        passwordLabel = new JLabel("Password: ");
        statusLabel = new JLabel(" ");

        addButton = new JButton("Add");
        copyButton = new JButton("Copy Info");
        sendEmailButton = new JButton("Send to Email");

        addButton.addActionListener(e -> addStudent());
        copyButton.addActionListener(e -> copyInfo());
        sendEmailButton.addActionListener(e -> sendToEmail());

        emailField.addKeyListener(new KeyAdapter() {
            public void keyReleased(KeyEvent e) {
                generateCredentials();
            }
        });

        generateCredentials();

        // Back button
        JButton backButton = new JButton("← Back");
        backButton.setFont(new Font("Arial", Font.PLAIN, 16));
        backButton.setPreferredSize(new Dimension(100, 35));
        backButton.addActionListener(e -> dispose());

        // Top panel for back button
        JPanel topPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 0, 0));
        topPanel.add(backButton);

        // Email row (label and field close together)
        JPanel emailPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        emailPanel.add(new JLabel("Email:"));
        emailPanel.add(emailField);

        // Info panel (application id and password)
        JPanel infoPanel = new JPanel();
        infoPanel.setLayout(new BoxLayout(infoPanel, BoxLayout.Y_AXIS));
        appIdLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        passwordLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        statusLabel.setAlignmentX(Component.LEFT_ALIGNMENT);
        infoPanel.add(appIdLabel);
        infoPanel.add(Box.createVerticalStrut(8));
        infoPanel.add(passwordLabel);
        infoPanel.add(Box.createVerticalStrut(8));
        infoPanel.add(statusLabel);

        JPanel buttonPanel = new JPanel();
        buttonPanel.setLayout(new BoxLayout(buttonPanel, BoxLayout.Y_AXIS));
        addButton.setMaximumSize(new Dimension(140, 30));
        copyButton.setMaximumSize(new Dimension(140, 30));
        sendEmailButton.setMaximumSize(new Dimension(140, 30));
        buttonPanel.add(addButton);
        buttonPanel.add(Box.createVerticalStrut(8));
        buttonPanel.add(copyButton);
        buttonPanel.add(Box.createVerticalStrut(8));
        buttonPanel.add(sendEmailButton);

        // Main layout
        JPanel leftPanel = new JPanel();
        leftPanel.setLayout(new BoxLayout(leftPanel, BoxLayout.Y_AXIS));
        leftPanel.add(emailPanel);
        leftPanel.add(Box.createVerticalStrut(12));
        leftPanel.add(infoPanel);

        JPanel mainPanel = new JPanel(new BorderLayout(10, 0));
        mainPanel.add(leftPanel, BorderLayout.CENTER);
        mainPanel.add(buttonPanel, BorderLayout.EAST);

        JPanel contentPanel = new JPanel(new BorderLayout());
        contentPanel.add(topPanel, BorderLayout.NORTH);
        contentPanel.add(mainPanel, BorderLayout.CENTER);

        setContentPane(contentPanel);
        setVisible(true);
    }

   private void generateCredentials() {
    try {
        // Get current month and year
        java.time.LocalDate now = java.time.LocalDate.now();
        String mm = String.format("%02d", now.getMonthValue());
        String yy = String.format("%02d", now.getYear() % 100);

        // Query DB for the highest increment for this in format MMYY
        String prefix = mm + yy + "_";
        int maxIncrement = 0;
        java.sql.Connection conn = DatabaseConnection.getConnection();
        java.sql.PreparedStatement stmt = conn.prepareStatement(
            "SELECT application_id FROM student_info WHERE application_id LIKE ?"
        );
        stmt.setString(1, prefix + "%");
        java.sql.ResultSet rs = stmt.executeQuery();
        while (rs.next()) {
            String appId = rs.getString("application_id");
            String[] parts = appId.split("_");
            if (parts.length == 2) {
                try {
                    int inc = Integer.parseInt(parts[1]);
                    if (inc > maxIncrement) maxIncrement = inc;
                } catch (NumberFormatException ignored) {}
            }
        }
        rs.close();
        stmt.close();
        conn.close();

        int nextIncrement = maxIncrement + 1;
        String newAppId = prefix + String.format("%04d", nextIncrement);

        generatedAppId = newAppId;
        generatedPassword = StudentInfoDAO.generateRandomPassword(6);
        appIdLabel.setText("Application ID: " + generatedAppId);
        passwordLabel.setText("Password: " + generatedPassword);
        statusLabel.setText(" ");
    } catch (Exception ex) {
        appIdLabel.setText("Application ID: ERROR");
        passwordLabel.setText("Password: ERROR");
        statusLabel.setText("Error: " + ex.getMessage());
    }
}

private void addStudent() {
    String email = emailField.getText().trim();
    if (email.isEmpty()) {
        statusLabel.setText("Email required.");
        return;
    }
    try {
        // Use the generatedAppId and generatedPassword as before
        StudentInfoDAO.insertStudentWithCredentials(generatedAppId, email, generatedPassword);
        statusLabel.setText("Added: " + generatedAppId);
        addButton.setEnabled(false);
    } catch (Exception ex) {
        statusLabel.setText("Error: " + ex.getMessage());
    }
}
//copy info button to clipboard function
    private void copyInfo() {
        String info = "Username: \"" + generatedAppId + "\"\nPassword: \"" + generatedPassword + "\"";
        StringSelection selection = new StringSelection(info);
        Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        clipboard.setContents(selection, selection);
        statusLabel.setText("Copied!");
    }

    private void sendToEmail() {
        String email = emailField.getText().trim();
        if (email.isEmpty()) {
            statusLabel.setText("Email required.");
            return;
        }
        // Dummy implementation
        statusLabel.setText("Sent to " + email + " (not implemented)");
    }
}