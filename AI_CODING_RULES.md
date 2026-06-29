# AI Coding Rules

File nay la quy tac lam viec cho AI khi doc tai lieu, phan tich yeu cau, thiet ke, viet code va tra loi trong du an.

## 1. Ngon ngu tra loi

- AI phai tra loi bang tieng Viet.
- Cau tra loi can ro rang, ngan gon, dung trong tam.
- Khi co thuat ngu ky thuat kho dich, co the giu nguyen tieng Anh va giai thich ngan neu can.

## 2. Cau truc tai lieu du an

### `docs/`

Thu muc `docs/` chua yeu cau chinh thuc cua du an.

AI phai doc tai lieu trong `docs/` truoc khi:

- phan tich yeu cau;
- de xuat chuc nang;
- thiet ke luong xu ly;
- viet hoac sua code;
- danh gia pham vi cong viec;
- tra loi cac cau hoi lien quan den nghiep vu du an.

Neu yeu cau trong cuoc tro chuyen khac voi noi dung trong `docs/`, AI phai bao ro diem khac nhau va hoi lai hoac neu gia dinh truoc khi trien khai.

### `plans/`

Thu muc `plans/` chua thiet ke trien khai, ke hoach ky thuat va testcase.

AI su dung `plans/` de:

- hieu kien truc da duoc thong nhat;
- kiem tra luong xu ly du kien;
- bam theo ke hoach trien khai;
- doi chieu testcase truoc va sau khi sua code;
- bo sung thiet ke hoac testcase khi duoc yeu cau.

Neu `plans/` chua co tai lieu phu hop, AI co the de xuat noi dung can bo sung nhung phai ghi ro do la de xuat.

## 3. Quy tac doc tai lieu

- Luon uu tien doc tai lieu hien co trong du an truoc khi ket luan.
- Khong tu suy dien yeu cau neu tai lieu chua neu ro.
- Khong bia tinh nang, API, database schema, rule nghiep vu hoac rang buoc ky thuat.
- Khi thieu thong tin, AI phai noi ro phan nao chua co trong tai lieu.
- Neu can tiep tuc lam viec du thieu thong tin, AI phai ghi ro gia dinh dang dung.

## 4. Quy tac khi viet hoac sua code

- Chi trien khai chuc nang da co can cu tu `docs/`, `plans/` hoac yeu cau truc tiep cua nguoi code.
- Bam theo kien truc, naming convention va style code dang co trong du an.
- Khong tu y thay doi pham vi lon ngoai yeu cau.
- Khong xoa hoac sua tai lieu, code, cau hinh khong lien quan neu chua duoc yeu cau.
- Khi sua code, can can nhac anh huong toi testcase, API contract, database schema va luong nguoi dung.

## 5. Quy tac khi goi y

AI duoc phep goi y cho nguoi code, nhung phai phan biet ro:

- phan nao la yeu cau da co trong tai lieu;
- phan nao la suy luan hop ly tu tai lieu;
- phan nao la de xuat them cua AI.

Goi y nen co ly do ro rang, vi du:

- giam rui ro ky thuat;
- tang tinh bao mat;
- giup de test hon;
- giup ke hoach 12 tuan thuc te hon;
- tranh phat sinh scope ngoai kiem soat.

## 6. Quy tac testcase

- Testcase nen duoc dat hoac mo ta trong `plans/`.
- Khi them chuc nang moi, AI nen kiem tra xem da co testcase tuong ung chua.
- Neu thieu testcase quan trong, AI can de xuat bo sung.
- Testcase nen bao gom happy path, edge case va loi thuong gap.

## 7. Quy tac bao cao ket qua

Khi hoan thanh mot viec, AI nen bao cao:

- da doc hoac dung tai lieu nao;
- da thay doi file nao;
- noi dung chinh da thay doi;
- da test hoac kiem tra gi;
- phan nao con rui ro hoac can nguoi code xac nhan.

## 8. Nguyen tac chong bia

Neu khong tim thay thong tin trong tai lieu, AI phai dung mot trong cac cach noi sau:

- "Trong tai lieu hien tai chua thay yeu cau nay."
- "Minh dang gia dinh rang..."
- "Day la de xuat them, chua phai yeu cau chinh thuc."
- "Can xac nhan them truoc khi trien khai."

AI khong duoc trinh bay gia dinh nhu su that da duoc thong nhat.

## 9. Thu tu lam viec khuyen nghi

Khi nhan task moi, AI nen lam theo thu tu:

1. Doc yeu cau lien quan trong `docs/`.
2. Doc thiet ke hoac testcase lien quan trong `plans/`.
3. Kiem tra code hien co neu task yeu cau sua code.
4. Neu task co rui ro hoac pham vi lon, neu ngan gon huong xu ly.
5. Thuc hien thay doi.
6. Kiem tra lai bang test, lint, build hoac review thu cong phu hop.
7. Bao cao ket qua bang tieng Viet.

## 10. Quy tac uu tien

Khi co mau thuan, uu tien theo thu tu:

1. Yeu cau truc tiep moi nhat cua nguoi code.
2. Tai lieu trong `docs/`.
3. Thiet ke va testcase trong `plans/`.
4. Code hien co trong du an.
5. Goi y hoac suy luan cua AI.

