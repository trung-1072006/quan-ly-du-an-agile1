package trungfpt.quanlyduanagile;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import trungfpt.quanlyduanagile.DAO.DBHelper;

public class login extends AppCompatActivity {
    EditText edtUserName;
    EditText edtPassword;
    Button btnSignin;
    TextView tvSignup;
    DBHelper db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_login);
        edtUserName = findViewById(R.id.edtUsername);
        edtPassword = findViewById(R.id.edtPassword);
        btnSignin = findViewById(R.id.btnSignin);
        tvSignup = findViewById(R.id.tvSignup);

        btnSignin.setOnClickListener(v ->{
            String user = edtUserName.getText().toString();
            String pass = edtPassword.getText().toString();

            if(user.isEmpty() || pass.isEmpty()){
                Toast.makeText(this, "Không được để trống", Toast.LENGTH_SHORT).show();
                return;
            }
            if(db.login(user,pass)){
                SharedPreferences sp = getSharedPreferences("SESSION",MODE_PRIVATE);
                sp.edit().putString("USER",user).apply();
                startActivity(new Intent(this, MainActivity.class));
                finish();
            } else {
            Toast.makeText(this, "Sai tài khoản hoặc mật khẩu", Toast.LENGTH_SHORT).show();
            }
            tvSignup.setOnClickListener(t ->{
                startActivity(new Intent(this, dangky.class));
            });
        });

    }
}