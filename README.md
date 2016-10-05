PKBackend
===================
RESTful-Webservice penghubung antara client Peta Kami dengan GeoServer untuk memanage GeoSpasial yang telah dibuat pada client. Selain itu PKBackend berperan dalam mengatur UserAuth dan UserLayerManagement.

----------

## Contents

 - [Installation](#installation)
	 - [Requirements](#requirements)
	 - [Tomcat 7](#tomcat-7)
	 - [GeoServer](#geoserver)
	 - [Postgresql & Postgis](#postgresql-and-postgis)
	 - [NodeJs](#nodejs)
 - [PK-Backend Setup](#pk-backend-setup)
	 - [GeoServer Connection](#geoserver-connection)
	 - [PostgreSQL Connection](#postgresql-connection)
	 - [Port & Host](#port-and-host)
	 - [VirtualHost](#virtualhost)
	 - [Running Forever](#running-forever)
 - [API Documentation](#api-documentation)
	 - [Generate API-Doc](#generate-api-doc)
	 - [Postman](#postman)

<h2 id="installation">Installation</h2>
<h3 id="requirements">Requirements</h3>
 - Ubuntu 14.04 LTS
 - Tomcat 7
 - GeoServer 2.8.4 / 2.9.0 
 - PostgreSQL 9.5.3
 - PostGIS 2.0
 - NodeJs 6.3.1
 - Forever

<h3 id="tomcat-7">Tomcat 7</h3>
#### Installing OpenJDK And Tomcat
Sebelum menginstall Tomcat kita membutuhkan Java JRE dan disini kita menggunakan OpenJDK.
```bash
$ sudo apt-get update
```
```bash
$ sudo apt-get install default-jdk
```
Setelah menginstall OpenJDK, dilanjutkan dengan menginstall Tomcat dan Tomcat Admin
```bash
$ sudo apt-get install tomcat7 tomcat7-admin
```
#### Setup Users
Setelah proses installasi Tomcat selesai, sekarang kita harus mensetup TomcatUser. Role yang perlu diaktifkan adalah "admin" dan "manager-gui", untuk dapat memanage TomcatGui.
```bash
$ sudo vim /var/lib/tomcat7/conf/tomcat-users.xml
```
```bash
<tomcat-users>
	<role rolename="manager-gui"/>
	<role rolename="admin"/>
	<user username="[username]" password="[password]" roles="admin,manager-gui"/>
</tomcat-users>
```
#### Tuning Tomcat
Agar mendapatkan kinerja yang maksimal pada aplikasi, kita perlu memberikan sumber daya yang lebih pada tomcat. Berikut adalah caranya:
```bash
$ sudo vim /etc/default/tomcat7
```
pada variable **JAVA_OPTS**:

 - Menetapkan nilai yang lebih tinggi untuk "maximum heap size(xmx)" contohnya ***-Xmx1024m*** (menyesuaikan dengan ressources yang tersedia).
 - Menetapkan nilai yang sama untuk "initial heap size parameter (xms)" dengan nilai yang sama dengan xmx, contoh: **-Xms1024m**

Selanjutnya kita dapat menetapkan nilai baru untuk "maxThreads". Aturan untuk menetapkan nilai dari "maxThreads" => x200 * jumlah core yang tersedia.
```bash
$ sudo vi /etc/tomcat7/server.xml
```
```
#tambahkan pada <connector>, contoh untuk 2 core:
maxThreads="400"
```

<h3 id="geoServer">GeoServer</h3>
#### Installing
File .war GeoServer dapat di download melalui link berikut: 
https://sourceforge.net/projects/geoserver/files/GeoServer/

Setelah file .war di download kita dapat mendeploy file tersebut melalui TomcatGui atau dengan cara berikut:
```bash
#unzip file terlebih dahulu
$ sudo unzip geoserver-2.8.4-war.zip

#pindahkan .war ke /var/lib/tomcat7/webapps
$ sudo mv geoserver-2.8.4-war/geoserver.war /var/lib/tomcat7/webapps 
```
Sekarang GeoServer telah running di server dan dapat diakses melalui link *[domain]*:8080/geoserver/web/ dengan default account (admin/geoserver).

#### Changing the 8080 port (*Optional)
Pada dokumentasi berikut kita menggunakan Apache untuk membuat virtual host, sebagai pilihan lain dapat menggunakan NginX(*dokumentasi menyusul*).
``` bash
$ sudo apt-get update
$ sudo apt-get install apache2 libapache2-mod-proxy-html
```
aktifkan module-module berikut:
``` bash
$ sudo a2enmod proxy
$ sudo a2enmod proxy_html
$ sudo a2enmod proxy_http
$ sudo service apache2 restart
``` 
selanjutnya mensetup apache vhost:
``` bash
$ sudo vim /etc/apache2/sites-available/000-default.conf
``` 
``` 
<VirtualHost *>
...
   ProxyRequests Off
   ProxyPreserveHost On
   <Proxy *>
         Order deny,allow
         Allow from all
   </Proxy>
   ProxyPass /geoserver http://127.0.0.1:8080/geoserver
   ProxyPassReverse /geoserver http://127.0.0.1:8080/geoserver
 ...
</VirtualHost>       
``` 
<h3 id="postgresql-and-postgis">Postgresql & Postgis</h3>
#### Install PostgreSQL
``` bash
$ sudo apt-get update
$ sudo apt-get install postgresql postgresql-contrib
``` 
#### Membuat Database dan User Baru (*Optional)
masuk kedalam postgresql
``` bash
$ su postgres
$ psql
``` 

create database dan user.
``` bash
#create database
$ CREATE DATABASE geodb;
$ CREATE DATABASE db_petakami;
#create user
$ CREATE USER geouser WITH PASSWORD 'mypassword';
```

setup user role.
``` bash
$ su postgres
$ psql -d geodb
$ GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA PUBLIC TO geouser;
$ GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA PUBLIC TO geouser;
$ GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA PUBLIC TO geouser;
```

aktifkan user baru dengan mengubah pq_hba.conf
``` bash
$ sudo su
$ sudo vim /etc/postgresql/9.5.3/main/pg_hba.conf
``` 
tambahkan perintah berikut pada database administrative login. 
```
# TYPE  DATABASE    USER        ADDRESS     METHOD
host    all         geouser     0.0.0.0/0   md5
```

(optional) mengizin akses postgresql dari cross network, sebagai contoh agar dapat diakses melalui PgAdmin
``` bash
$sudo vim /etc/postgresql/9.5.3/main/postgresql.conf

#uncomment listen_addresses dan set value '*'
listen_addresses = '*'
```

setelah itu restart postgresql.
``` bash
$ sudo service postgresql restart 9.5.3
```

#### Install Postgis
``` bash
$ sudo apt-get install postgis*
$ cd /usr/share/postgresql/9.5.3/contrib/postgis-2.1/
$ su postgres
$ psql -d geodb -f postgis.sql
$ psql -d geodb -f spatial_ref_sys.sql
$ psql -d geodb -f postgis_upgrade_21_minor.sql
```
<h3 id="nodejs">NodeJs</h3>
#### Install NodeJs
``` bash
$ sudo apt-get update
$ curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
$ sudo apt-get install -y nodejs
``` 

#### Install Forever
CLI tool untuk running nodejs script terus menerus.
``` bash
$ sudo npm install forever -g
``` 
contoh untuk mendaftarkan, view jobs dan stop job app ke forever 
``` bash
# start app
$ forever start app,js
# forever job list
$ forever list
# forever stop job
$forever stop (key)
``` 

#### Install GIT
``` bash
$ sudo apt-get update
$ sudo apt-get install git
``` 

setelah menginstall Git, kita dapat mengclone project PetaKami.
``` bash
# clone backend
$ sudo git clone https://github.com/jeins/PKBackend.git

#clone frontend
$ sudo git clone https://github.com/jeins/PKFrontend.git
``` 
setalah project diclone kita dapat melihat folder project PKBackend / PKFrontend

<h2 id="pk-backend-setup">PK-Backend Setup</h2>
TODO
<h3 id="geoserver-connection">GeoServer Connection</h3>
TODO
<h3 id="postgresql-connection">PostgreSQL Connection</h3>
TODO
<h3 id="port-and-host">Port & Host</h3>
TODO
<h3 id="virtualhost">VirtualHost</h3>
TODO
<h3 id="running-forever">Running Forever</h3>
TODO

<h2 id="api-documentation">API Documentation</h2>
TODO
<h3 id="generate-api-doc">Generate API-Doc</h3>
TODO
<h3 id="postman">Postman</h3>
TODO
