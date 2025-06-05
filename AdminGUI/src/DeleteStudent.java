import java.awt.*;
import javax.swing.*;

public class DeleteStudent {
    public static boolean confirmAndDelete(JFrame parent, String applicationId) {
        final boolean[] deleted = {false};

        // Create dialog for confirmation
        JDialog dialog = new JDialog(parent, "Confirm Delete", true);
        dialog.setLayout(new BorderLayout(10, 10));

        JLabel msg = new JLabel(
            "<html>This will permanently delete app_id <b>\"" +
            applicationId +
            "\"</b></html>", SwingConstants.CENTER);
        msg.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));

        JButton confirmBtn = new JButton("Confirm Delete");
        confirmBtn.setFont(new Font("Arial", Font.BOLD, 16));
        confirmBtn.addActionListener(ev -> {
            try {
                StudentInfoDAO.deleteStudent(applicationId);
                JOptionPane.showMessageDialog(dialog, "Student deleted.");
                deleted[0] = true;
                dialog.dispose();
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(dialog, "Error: " + ex.getMessage());
            }
        });

        JPanel btnPanel = new JPanel();
        btnPanel.add(confirmBtn);

        dialog.add(msg, BorderLayout.CENTER);
        dialog.add(btnPanel, BorderLayout.SOUTH);
        dialog.setSize(400, 180);
        dialog.setLocationRelativeTo(parent);
        dialog.setVisible(true);

        return deleted[0];
    }
}