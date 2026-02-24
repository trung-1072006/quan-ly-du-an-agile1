package trungfpt.quanlyduanagile;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import trungfpt.quanlyduanagile.DAO.DBHelper;

public class dangky extends AppCompatActivity {

    EditText txtUsername, txtPassword, txtConfirmPass;
    Button btnSignin;
    TextView tvSignup;
    DBHelper db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dangky); // đổi đúng tên xml

        // Ánh xạ
        txtUsername = findViewById(R.id.txtUsername);
        txtPassword = findViewById(R.id.txtPassword);
        txtConfirmPass = findViewById(R.id.txtConfirmPass);
        btnSignin = findViewById(R.id.btnSignin);
        tvSignup = findViewById(R.id.tvSignup);

        db = new DBHelper(this);

        // Xử lý đăng ký
        btnSignin.setOnClickListener(v -> handleRegister());

        // Quay lại màn hình đăng nhập
        tvSignup.setOnClickListener(v -> finish());
    }

    private void handleRegister() {
        String user = txtUsername.getText().toString().trim();
        String pass = txtPassword.getText().toString().trim();
        String confirm = txtConfirmPass.getText().toString().trim();

        // 1️⃣ Kiểm tra trống
        if (user.isEmpty() || pass.isEmpty() || confirm.isEmpty()) {
            Toast.makeText(this, "Vui lòng nhập đầy đủ thông tin", Toast.LENGTH_SHORT).show();
            return;
        }

        // 2️⃣ Kiểm tra mật khẩu trùng nhau
        if (!pass.equals(confirm)) {
            Toast.makeText(this, "Mật khẩu xác nhận không khớp", Toast.LENGTH_SHORT).show();
            return;
        }

        // 3️⃣ Đăng ký vào database
        boolean success = db.register(user, pass);
        if (success) {
            Toast.makeText(this, "Đăng ký thành công!", Toast.LENGTH_SHORT).show();
            finish(); // quay về Login
        } else {
            Toast.makeText(this, "Tài khoản đã tồn tại", Toast.LENGTH_SHORT).show();
        }
    }
}
