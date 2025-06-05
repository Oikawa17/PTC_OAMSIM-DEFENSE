import java.awt.Desktop;
import java.io.File;
import javax.swing.JFrame;
import javax.swing.JOptionPane;

public class ShowDocs {
    /**
     * 
     * @param parent 
     * @param applicationId 
     */
    public static void openDocumentsFolder(JFrame parent, String applicationId) {
        File folder = new File("../backend/uploads/" + applicationId);
        if (folder.exists() && folder.isDirectory()) {
            try {
                Desktop.getDesktop().open(folder.getCanonicalFile());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(parent, "Error opening folder:\n" + ex.getMessage());
            }
        } else {
            JOptionPane.showMessageDialog(parent, "Document folder not found.");
        }
    }
}